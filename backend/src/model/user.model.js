import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const AddressSchema = new Schema({
  type: {
    type: String,
    enum: ["Home", "Work"],
    required: true,
  },
  street: String,
  city: String,
  state: String,
  landMark: String,
  postalCode: Number,
  country: String,
  isDefault: {
    type: Boolean,
    default: false,
  },
});


const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    verificationToken: {
      type: String,
      minlength: 4
    },
    tokenExpiry: {
      type: Date
    },
    forgetToken: {
      type: String,
      minlength: 4
    },
    forgetExpiry: {
      type: Date
    },
    verified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    addresses: {
      type: [AddressSchema],
      validate: [arrayLimit, "Address exceeds the limit of 2"],
      default: [],
    },
    phone: {
      type: String,
      minlength: 10,
      maxlength: 13
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", function (next) {
  if (this.addresses && this.addresses.length > 0) {
    this.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
    this.addresses[this.addresses.length - 1].isDefault = true;
  }

  if (this.isModified("verificationToken")) {
    this.tokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
  }
  next();
});

function arrayLimit(val) {
  return val.length <= 2;
}

const User = models.User || model("User", UserSchema);

export default User;
