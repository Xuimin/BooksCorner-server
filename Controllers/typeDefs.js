const { gql } = require('apollo-server')

const typeDefs = gql`
  scalar Upload
  
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
    url: String!
  }

  type User {
    id: ID
    username: String
    email: String
    password: String
    image: String
    isAdmin: Boolean
  }
  
  input RegisterInput {
    username: String
    email: String
    password: String
    password2: String
  }
  
  type Token {
    token: String
  }

  input LoginInput {
    email: String
    password: String
  }

  type Wallet {
    id: ID
    userId: ID
    amount: String
  }

  type Books {
    id: ID
    booksId: ID
    title: String
    description: String
    price: String
    isAvailable: Boolean
    image: String
    category: String,
    ISBN: String,
    isRecommended: Boolean
    overall: Int
  }

  input BooksInput {
    title: String
    description: String
    price: String
    image: String
    category: String
    ISBN: String
  }

  type Cart {
    id: ID
    bookId: ID
    book: [Books]
  }
  
  type BorrowCart {
    id: ID
    userId: ID
    cart: [Cart]
  }

  type Borrow {
    bookId: ID
    book: [Books]
    date_borrowed: String
    date_return: String
    isPending: Boolean
  }

  type BorrowList {
    id: ID
    userId: ID
    borrow: [Borrow]
    amount: Int
  }

  input BorrowListInput {
    date_borrowed: String
    date_return: String
  }

  type ToReturn {
    bookId: ID
    book: [Books]
    date_return: String
  }

  type ReturnList {
    userId: ID
    toReturn: [ToReturn]
  }

  type Rates {
    username: String
    rating: String
    comment: String
    isEdited: Boolean
  }

  type Rating {
    id: ID
    bookId: ID
    book: [Books]
    rate: [Rates]
  }

  input RatingInput {
    bookId: ID
    username: String
    rating: String
    comment: String
  }

  type Likes {
    bookId: ID
    book: [Books]
  }

  type Favorite {
    id: ID
    userId: ID
    likes: [Likes]
  }

  # getting data
  type Query {
    getAllUser: [User]
    getUser(username: String): User

    getWallet(userId: ID): Wallet

    getAllBooks: [Books]
    getRecommendedBooks: [Books]
    getSingleBook(id: ID): Books
    searchBookCategory(category: String): [Books]

    getBorrowCart(userId: ID): BorrowCart

    getBorrowList(userId: ID): [BorrowList]

    getReturnList: [ReturnList]

    getBookRating(bookId: ID): Rating

    getFavorite(userId: ID): Favorite
  }

  # functions
  type Mutation {
    bookImageUpload(file: Upload!, bookId: ID): File!

    register(user: RegisterInput): User
    login(user: LoginInput): Token
    googleLogin(username: String, email: String): Token

    topUpWallet(userId: ID, amount: String): Wallet

    addBooks(books: BooksInput): Books
    deleteBooks(id: ID): Books
    editBooks(id: ID, books: BooksInput): Books
    recommendBooks(id: ID): Books

    addBorrowCart(userId: ID, bookId: ID): BorrowCart
    deleteSingleBorrowCart(userId: ID, bookId: ID): BorrowCart
    emptyBorrowCart(userId: ID): BorrowCart

    borrow(userId: ID, bookId: ID, borrows: BorrowListInput): BorrowList
    returnMyBook(userId: ID, bookId: ID): BorrowList
    approveReturn(userId: ID, bookId: ID, amount: String): BorrowList

    addRating(rated: RatingInput): Rating
    deleteRating(username: String, bookId: ID): Rating
    editRating(rated: RatingInput): Rating
    
    addFavorite(userId: ID, bookId: ID): Favorite
    deleteFavorite(userId: ID, bookId: ID): Favorite
  }

`

module.exports = typeDefs