const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
    me: async (parent, args, context) => {
        if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
            "-__v -password"
        );

        return userData;
        }
        throw new AuthenticationError("Login failed");
    },
    },

    Mutation: {
    addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);

        return { token, user };
    },
    login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });

        if (!user) {
        throw new AuthenticationError("Invalid credentials");
    }

        const correctPw = await user.isCorrectPassword(password);

    if (!correctPw) {
        throw new AuthenticationError("Invalid credentials");
    }

        const token = signToken(user);
        return { token, user };
    },
    saveBook: async (parent, { bookData }, context) => {

    if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
            { _id: context.user._id },
            { $push: { savedBooks: bookData } },
            { new: true }
        );

        return updatedUser;
    }

        throw new AuthenticationError("You must be logged in");
    },
    // retrieve the logged in user from the context and remove the book from the user's savedBooks array
    removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
            return User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId: bookId } } },
                { new: true }
            );
        }
        throw new AuthenticationError('You need to be logged in!');
        },
    },
};

module.exports = resolvers;