import { getDb } from "../db/db.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const SECRET_KEY = process.env.SECRET_KEY

export const getAllUsers = async (req, res) => {
  const db = getDb()
  try {
    const collection = db.collection('users');
    const result = await collection.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error saat mengambil data:", error);
    res.status(500).send("Terjadi kesalahan server");
  }
}

export const registerUser = async (req, res) => {
  const db = getDb()
  const {firstName, email, password } = req.body
  try{
    if(!firstName | !email || !password) {
      console.log('masuk sini')
      return res.status(400).json("Semua data harus diisi")
    }
    const collection = db.collection("users")

    // validasi email
    const existingUser = await collection.findOne({email})
    if(existingUser){
      return res.status(400).json("Email sudah terdaftar")
    }

    // password di hash
    const hashedPassword = await bcrypt.hash(password, 10)

    // simpan ke database
    const newUser = { firstName, email, password: hashedPassword};
    await collection.insertOne(newUser)

    res.status(201).json("Registrasi berhasil")
  }catch{
    console.error("Error saat registrasi", error)
    res.status(500).send("Terjadi kesalahan server.")
  }
}

export const LoginUser = async (req, res) => {
  const db = getDb()
  const {email, password} = req.body
  console.log(req.body)
  try {

    if(!email || !password){
      return res.status(400).json({message : "Email dan password harus diisi."})
    }

    const collection = db.collection("users")

    // cari user berdasarkan email
    const user = await collection.findOne({email})
    if(!user){
      return res.status(400).json({message : "Email atau password salah."})
    }

    // password diperiksa
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid){
      return res.status(400).json({message : "Email atau password salah."})
    }

    // buat jwt
    const token = jwt.sign({id: user._id, email:user.email, firstName : user.firstName}, SECRET_KEY, {expiresIn : "1h"})

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600 * 1000, // 1 jam
    }).status(200).json({ message: "Login berhasil." });
  } catch{
    console.error("Error saat login:", error);
    res.status(500).send("Terjadi kesalahan server.");
  }
}

export const logout = async (req, res) => {
  res.clearCookie('token'); // Hapus cookie token
  res.status(200).send({ message: 'User logged out successfully', success : true });
}
