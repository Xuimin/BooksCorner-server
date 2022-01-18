const User = require('../Models/User')
const Wallet = require('../Models/Wallet')
const Book = require('../Models/Books')
const BorrowCart = require('../Models/BorrowCart')
const BorrowList = require('../Models/BorrowList')
const Favorite = require('../Models/Favorite')
const Rating = require('../Models/Rating')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError } = require('apollo-server-errors')
require('dotenv').config()
const path = require('path')
const fs = require('fs')

const {
  GraphQLUpload,
  graphqlUploadExpress
} = require('graphql-upload')
const ReturnList = require('../Models/ReturnList')

const resolvers = {
  Query: {
    // USER
    getAllUser: async() => await User.find(),
    getUser: async(_, {username}) => await User.findOne({username}),

    // WALLET
    getWallet: async(_, {userId}) => await Wallet.findOne({userId}),

    // BOOKS
    getAllBooks: async() => await Book.find(),
    getRecommendedBooks: async() => await Book.find({isRecommended: true}),
    getSingleBook: async(_, {id}) => await Book.findById(id),
    searchBookCategory: async(_, {category}) => await Book.find({category}),

    // BORROWCART/WISHLIST
    getBorrowCart: async(_, {userId}) => await BorrowCart.findOne({userId}),

    // BORROWLIST 
    getBorrowList: async(_, {userId}) => {
      const user = await User.findById(userId)
      const admin = user.isAdmin

      if(admin) {
        const borrowList = await BorrowList.find()
        return borrowList
      } else {
        const borrowList = await BorrowList.find({userId})
        return borrowList
      }
    },

    // RETURNLIST
    getReturnList: async() => await ReturnList.find(),

    // RATING
    getBookRating: async(_, {bookId}) => await Rating.findOne({bookId}),

    // FAVORITE
    getFavorite: async(_, {userId}) => await Favorite.findOne({userId}),
  },

  Upload: GraphQLUpload,

  Mutation: {
    // BOOK IMAGE
    bookImageUpload: async (_, args) => {
      const { createReadStream, filename } = await args.file
      const bookId = args.bookId
      const book = await Book.findById(bookId)
      const stream = createReadStream()
      
      const date = new Date().getTime()

      book.image = `/Public/booksImage/${date}-${filename}`
      book.save()
      
      const pathName = path.join(__dirname, `../Public/booksImage/${date}-${filename}`)
      
      const out = fs.createWriteStream(pathName)
      stream.pipe(out)
      console.log(`http://localhost:4000/booksImage/${date}-${filename}`) 
      
      return { url: `http://localhost:4000/booksImage/${date}-${filename}` }
    },

    // USER
    register: async(_, args) => {
      const { username, email, password, password2 } = args.user
      const found = await User.findOne({email})
      const foundUsername = await User.findOne({username})

      if(foundUsername) throw new UserInputError('Username taken! Please use another username')
      
      if(found) {
        throw new UserInputError("User Already Exists!")
      } else {
        if(password == password2) {
          let salt = bcrypt.genSaltSync(10)
          let hash = bcrypt.hashSync(password, salt)
  
          const user = new User({
            username,
            email,
            password: hash
          })
          const wallet = new Wallet({
            userId: user.id
          })
          await user.save()
          await wallet.save()
          return user
        } else throw new UserInputError('Password and Confirm Password do not match')
      }
    },
    login: async(_, args) => {
      const { email, password } = args.user
      const foundUser = await User.findOne({ email })

      if(!foundUser) {
        throw new UserInputError("This user doesn't exists. Please register an account!")
      } else {
        let isMatch = bcrypt.compareSync(password, foundUser.password)

        if(!isMatch) throw new UserInputError("Invalid Credentials")
        let payload = {foundUser}
  
        const token = jwt.sign(
          payload,
          process.env.SECRET_KEY,
          { expiresIn: '2h' }
        )
        return { token }
      }
    }, 
    googleLogin: async(_, args) => {
      const { username, email } = args
      const foundUser = await User.findOne({email})

      if(foundUser) {
        let payload = { foundUser }
        const token = jwt.sign(
          payload,
          process.env.SECRET_KEY,
          { expiresIn: '2h' }
        )
        return { token }
      } else {
        const user = new User({
          username,
          email, 
          password: null
        }) 
        
        const wallet = new Wallet({
          userId: user.id
        })
        await user.save()
        await wallet.save()

        if(foundUser) {
          let payload = { user }
          const token = jwt.sign(
            payload,
            process.env.SECRET_KEY,
            { expiresIn: '2h' }
          )
          return { token }
        }
      }
    },

    // WALLET
    topUpWallet: async(_, args) => {
      const { userId, amount } = args
      const wallet = await Wallet.findOne({userId})

      wallet.amount += parseInt(amount)
      await wallet.save()
      return wallet
    },

    // BOOKS
    addBooks: async(_, args) => {
      const { title, description, price, category, ISBN } = args.books
      const books = new Book({
        title,
        description,
        price,
        category,
        ISBN
      })
      await books.save()
      return books
    },
    deleteBooks: async(_, args) => {
      const books = await Book.findByIdAndDelete(args.id)
      const rating = await Rating.findOne({bookId: args.id})

      if(rating) {
        rating.remove()
      }
      return books
    },
    editBooks: async(_, args) => {
      const id = args.id
      const { title, description, price, category, ISBN } = args.books
      const books = await Book.findById(id)
      books.title = title
      books.description = description
      books.price = price
      books.category = category
      books.ISBN = ISBN

      await books.save()
      return books
    },
    recommendBooks: async(_, args) => {
      const books = await Book.findById(args.id)

      if(books.isRecommended === false) {
        books.isRecommended = true
      } else {
        books.isRecommended = false
      }
      await books.save()
      return books
    },

    // BORROWCART/WISHLIST
    addBorrowCart: async(_, args) => {
      const { userId, bookId } = args
      const borrowCart = await BorrowCart.findOne({userId})
      const book = await Book.findById(bookId)
      
      if(borrowCart) {
        const books = await borrowCart.cart.find(book => book.bookId === bookId)
        if(books) throw new UserInputError("Already Added to BorrowCart")
        else {
          borrowCart.cart.push({
            bookId,
            book: [{
              booksIds: book.id,
              title: book.title,
              price: book.price,
              image: book.image,
              category: book.category
            }]
          })
          await borrowCart.save()
          return borrowCart
        }
      } else {
        const cart = new BorrowCart({
          userId,
          cart: [{
            bookId,
            book: [{
              booksIds: book.id,
              title: book.title,
              price: book.price,
              image: book.image,
              category: book.category
            }]
          }]
        })
        await cart.save()
        return cart
      }
    }, 
    deleteSingleBorrowCart: async(_, args) => {
      const { userId, bookId } = args
      const borrowCart = await BorrowCart.findOne({userId})
      const books = await borrowCart.cart.find(book => book.bookId === bookId)
      
      await books.remove()
      await borrowCart.save()
      return borrowCart
    },
    emptyBorrowCart: async(_, {userId}) => {
      const borrowCart = await BorrowCart.findOneAndDelete({userId})
      return borrowCart
    },

    // BORROWLIST
    borrow: async(_, args) => {
      const { userId, bookId } = args
      const { date_borrowed, date_return } = args.borrows
      const book = await Book.findById(bookId)
      const wallet = await Wallet.findOne({userId})
      const borrowList = await BorrowList.findOne({userId})

      const bookAvailability = book.isAvailable

      if(bookAvailability === false) throw new UserInputError(`Sorry this book has been borrowed. You can borrow it again after ${date_return}`)

      if(wallet.amount >= book.price) {
        wallet.amount = wallet.amount - book.price
        wallet.save()
      } else throw new UserInputError('Insufficient money. Please top up your wallet')

      if(borrowList) {
        const max = borrowList.amount
        if(max > 3) throw new UserInputError('Sorry, you can only borrow a maximum amount of 3 books. Please return before borrowing.')

        const borrowed = await borrowList.borrow.find(book => book.bookId === bookId)
        
        if(borrowed) throw new UserInputError('You had borrowed this book')
        borrowList.borrow.push({
          bookId,
          book: [{
            booksId: book.id,
            title: book.title,
            price: book.price,
            image: book.image,
            category: book.category
          }],
          date_borrowed,
          date_return
        })
        book.isAvailable = false
        book.save()
        borrowList.amount = borrowList.borrow.length
        borrowList.save()
        return borrowList

      } else {
        const newBorrowList = new BorrowList({
          userId,
          borrow: [{
            bookId,
            book: [{
              booksId: book.id,
              title: book.title,
              price: book.price,
              image: book.image,
              category: book.category
            }],
            date_borrowed,
            date_return
          }],
          amount: 1
        })
        book.isAvailable = false
        await book.save()
        await newBorrowList.save()
        return newBorrowList
      }
    }, 
    returnMyBook: async(_, args) => {
      const { userId, bookId } = args
      const borrowList = await BorrowList.findOne({userId})
      const returnBook = await borrowList.borrow.find(target => target.bookId === bookId)

      const returnList = new ReturnList({
        userId,
        toReturn: [{
          bookId,
          book: [{
            title: returnBook.book[0].title,
            price: returnBook.book[0].price
          }],
          date_return: returnBook.date_return
        }]
      })
      await returnList.save()

      returnBook.isPending = true
      borrowList.save()
      return borrowList
    },
    approveReturn: async(_, args) => {
      const { userId, bookId, amount } = args
      const wallet = await Wallet.findOne({userId})
      const book = await Book.findById(bookId)
      const borrowList = await BorrowList.findOne({userId})
      const returnBook = borrowList.borrow.find(book => book.bookId === bookId)
      const returnList = await ReturnList.findOne({'toReturn[0].bookId': bookId})

      returnList.remove()
      returnBook.remove()
      borrowList.amount = borrowList.borrow.length
      borrowList.save()

      book.isAvailable = true
      wallet.amount += parseInt(amount)
      book.save()
      wallet.save()
      return borrowList
    },

    // RATING
    addRating: async(_, args) => {
      const { bookId, username, rating, comment } = args.rated
      const user = await User.findOne({username})
      const admin = user.isAdmin
      const exists = await Rating.findOne({bookId})
      const book = await Book.findById(bookId)

      if(admin) {
        throw new UserInputError('Admin is not allowed to give a rating!')
      } else {
        if(exists) {
          const rated = await exists.rate.find(r => r.username === username)
          if(rated) throw new UserInputError('You can only give a rating once. Please edit your previous rating instead')
          
          exists.rate.push({
            username,
            rating,
            comment
          })

          let totalRating = 0
          exists.rate.forEach(rate => totalRating += rate.rating)
          const overall = totalRating / exists.rate.length

          book.overall = overall
          book.save()
          exists.save()
          return exists
        } else {
          const giveRating = new Rating({
            bookId,
            book: [{
              booksId: book.id,
              title: book.title,
              price: book.price,
              image: book.image,
              category: book.category
            }],
            rate: [{
              username,
              rating,
              comment
            }]
          })
          book.overall = rating
          book.save()
          await giveRating.save()
          return giveRating
        }
      }
    },
    deleteRating: async(_, args) => {
      const { username, bookId } = args
      const rating = await Rating.findOne({bookId})
      const book = await Book.findOne({id: bookId})
      const deleted = await rating.rate.find(d => d.username === username)

      if(deleted) {
        deleted.remove()

        let totalRating = 0
        rating.rate.forEach(rate => totalRating += rate.rating)

        if(rating.rate.length !== 0) {
          const overall = totalRating / rating.rate.length
          book.overall = overall
        } else {
          book.overall = 0
        }   
        book.save()
        rating.save()
      }
      return rating
    },
    editRating: async(_, args) => {
      const { bookId, username, rating, comment } = args.rated
      const bookRating = await Rating.findOne({bookId})
      const userRating = await bookRating.rate.find(target => target.username === username)
      const book = await Book.findOne({id: bookId})

      if(userRating) {
        userRating.rating = rating
        userRating.comment = comment
        userRating.isEdited = true

        let totalRating = 0
        bookRating.rate.forEach(rate => totalRating += rate.rating)
        const overall = totalRating / bookRating.rate.length

        book.overall = overall
        book.save()
        bookRating.save()
      }
      return bookRating
    },

    // FAVORITE
    addFavorite: async(_, args) => {
      const { userId, bookId } = args
      const favorite = await Favorite.findOne({userId})
      const book = await Book.findById(bookId)
      
      if(favorite) {
        const likes = await favorite.likes.find(target => target.bookId === bookId)
  
        if(likes) throw new UserInputError('Already added to favorite!')
        favorite.likes.push({
          bookId,
          book: [{
            booksId: bookId,
            title: book.title,
            price: book.price,
            image: book.image,
            category: book.category
          }]
        })
        await favorite.save()
        return favorite
      } else {
        const fav = new Favorite({
          userId,
          likes: [{
            bookId,
            book: [{
              booksId: bookId,
              title: book.title,
              price: book.price,
              image: book.image,
              category: book.category
            }]
          }]
        })
        await fav.save()
        return fav
      }
    },
    deleteFavorite: async(_, args) => {
      const { userId, bookId } = args
      const favorite = await Favorite.findOne({userId})
      const dislike = await favorite.likes.find(t => t.bookId === bookId)
      
      dislike.remove()
      favorite.save()
      return favorite
    }
  }
}

module.exports = resolvers