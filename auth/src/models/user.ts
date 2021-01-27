import mongoose from 'mongoose'
import { Password } from '../services/password'

// An interface that describes the properties that
// are required to create a new User
interface UserAttrs {
  email: string
  password: string
}

// An interface that describes the properties
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc
}

// An interface that describes the properties
// that a User Document has
interface UserDoc extends mongoose.Document {
  email: string
  password: string
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      // Defining this in the model is not the very best approach
      // since it handles some logic more related to the view, but
      // it serves our purpose here.
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.password
      },
      versionKey: false,
    },
  }
)

// Mongoose pre save hook.
// We use function keyword so that 'this' is correctly bound
// to the actual document that we are trying to save
userSchema.pre('save', async function (done) {
  // Only attempt to hash the password if it has been modified
  // (or newly created, which is the same to mongoose)
  // because this hook will run also for email changes for example.
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'))
    this.set('password', hashed)
  }

  done()
})

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }
