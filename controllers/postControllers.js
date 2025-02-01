// posts-controller.js
import { createPosts } from "../model/posts-model.js";
import { getDb } from "../db/db.js";
import { ObjectId } from "mongodb";

// create post
export const handleCreatePost = async (req, res) => {
  let { cover, title, content, userId, createdAt } = req.body;

  userId = new ObjectId(userId);
  try {
    // Validasi input
    if (!cover || !title || !content || !userId || !createdAt) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await createPosts({
      cover,
      title,
      content,
      userId,
      createdAt
    });

    res.status(201).json({
      message: "Post created successfully",
      success: true,
      post: result,
    });
  } catch (error) {
    console.error("Error in create post controller:", error);
    res.status(500).json({
      message: "Failed to create post",
      success: false,
      error: error.message,
    });
  }
};

//  get all post
export const getAllPosts = async (req, res) => {
  const db = getDb();
  try {
    const collection = db.collection("posts");

    // Tahap untuk mengonversi userId menjadi ObjectId
    const lookupUserInfo = {
      $lookup: {
        from: "users", // Nama koleksi yang akan di-join
        localField: "userId", // Field di posts
        foreignField: "_id", // Field di users
        as: "userInfo", // Nama field hasil join
      },
    };

    // Tahap untuk membuka array userInfo menjadi objek
    const unwindUserInfo = {
      $unwind: {
        path: "$userInfo", // Membuka array userInfo
        preserveNullAndEmptyArrays: true, // Tetap sertakan data meskipun user tidak ditemukan
      },
    };

    const rawData = {
      $project: {
        _id: 1,
        title: 1,
        userId: 1,
        cover: 1,
        content: 1,
        createdAt: 1,
        "userInfo.firstName": 1,
        "userInfo.email": 1,
        "userInfo._id": 1,
      },
    };

    const pipeline = [lookupUserInfo, unwindUserInfo, rawData];

    const result = await collection.aggregate(pipeline).toArray();
    res.json(result); // Kirim hasil ke frontend
  } catch (error) {
    console.error("Error saat mengambil data:", error);
    res.status(500).send("Terjadi kesalahan server");
  }
};

// get all post by user id
export const getPostByUserId = async (req, res) => {
  const userId = new ObjectId(req.params.userId)
  const db = getDb();
  try {
    const collection = db.collection("posts")
    // const result = await collection.find({"userId" : userId}).toArray()
    const match = {$match : {userId : userId}}
    const lookup = {
      $lookup : {
        from : "users",
        localField : "userId",
        foreignField : "_id",
        as : "userInfo"
      }
    }
    const unwindUserInfo = {
      $unwind: {
        path: "$userInfo", // Membuka array userInfo
        preserveNullAndEmptyArrays: true, // Tetap sertakan data meskipun user tidak ditemukan
      },
    };
    const rawData = {
      $project: {
        _id: 1,
        title: 1,
        userId: 1,
        cover: 1,
        content: 1,
        createdAt: 1,
        "userInfo.firstName": 1,
        "userInfo.email": 1,
        "userInfo._id": 1,
      },
    };
    const pipeline = [match, lookup, unwindUserInfo, rawData];
    const result = await collection.aggregate(pipeline).toArray()
    res.json(result)
  } catch (error) {
    res.status(500).send("Internal server error")
  }
};

// delete post by post id
export const deletePost = async (req, res) => {
  const postId = new ObjectId(req.params.postId)
  const db = getDb();

  try {
    const deletedPost = await db.collection('posts').findOneAndDelete({_id : postId})
    if(!deletedPost.value) return res.status(404).json({message : 'Post tidak ditemukan'})
    
    res.json({message : 'Post berhasil dihapus', deletedPost : deletedPost.value} )
  } catch (error) {
    res.status(500).send("Internal server error")
  }
}

export const detailPost = async (req, res) => {
  const postId = new ObjectId(req.params.postId)
  const userId = new ObjectId(req.params.userId)
  const db = getDb()
  if(!userId || !postId){
    return res.status(401).json({ message: "Tidak diizinkan" });
  }
  const result = await db.collection('posts').findOne({"_id": postId})
  if (!result) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.json(result)
  try {
    
  } catch (error) {
    res.status(500).send("Internal server error")
  }
}

export const editPost = async (req, res) => {
  
}