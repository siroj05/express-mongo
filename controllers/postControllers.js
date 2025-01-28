// posts-controller.js
import { createPosts } from "../model/posts-model.js";
import { getDb } from "../db/db.js";
import { ObjectId } from "mongodb";
export const handleCreatePost = async (req, res) => {
  let { cover, title, content, userId } = req.body;
  userId = new ObjectId(userId)
  try {
    // Validasi input
    if (!cover || !title || !content || !userId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await createPosts({ cover, title, content, userId });
   
    res.status(201).json({
      message: 'Post created successfully',
      success : true,
      post: result
    });
  } catch (error) {
    console.error('Error in create post controller:', error);
    res.status(500).json({
      message: 'Failed to create post',
      success : false,
      error: error.message
    });
  }
};

export const getPosts = async (req, res) => {
  const db = getDb();
  try {
    const collection = db.collection('posts');

    // Tahap untuk mengonversi userId menjadi ObjectId
    const lookupUserInfo = {
      $lookup: {
        from: 'users', // Nama koleksi yang akan di-join
        localField: 'userId', // Field di posts
        foreignField: '_id', // Field di users
        as: 'userInfo', // Nama field hasil join
      },
    };

    // Tahap untuk membuka array userInfo menjadi objek
    const unwindUserInfo = {
      $unwind: {
        path: '$userInfo', // Membuka array userInfo
        preserveNullAndEmptyArrays: true, // Tetap sertakan data meskipun user tidak ditemukan
      },
    };

    const rawData = {
      $project:{
        _id:1,
        title:1,
        userId:1,
        cover:1,
        content:1,
        'userInfo.firstName':1,
        'userInfo.email':1,
        'userInfo._id':1
      }
    }

    const pipeline = [
      lookupUserInfo,
      unwindUserInfo,
      rawData
    ]

    const result = await collection.aggregate(pipeline).toArray()
    res.json(result); // Kirim hasil ke frontend
  } catch (error) {
    console.error('Error saat mengambil data:', error);
    res.status(500).send('Terjadi kesalahan server');
  }
};
