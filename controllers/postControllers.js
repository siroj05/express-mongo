// posts-controller.js
import { createPosts } from "../model/posts-model.js";
import { getDb } from "../db/db.js";
import { ObjectId } from "mongodb";

// create post
export const handleCreatePost = async (req, res) => {
  let { cover, title, content, userId } = req.body;

  userId = new ObjectId(userId);
  try {
    // Validasi input
    if (!cover || !title || !content || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await createPosts({
      cover,
      title,
      content,
      userId,
      createdAt: new Date(),
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

    const sortByCreatedAt = {
      $sort: { createdAt: -1 }, // -1 descending, 1 ascending
    };

    const pipeline = [lookupUserInfo, unwindUserInfo, rawData, sortByCreatedAt];

    const result = await collection.aggregate(pipeline).toArray();
    res.json(result); // Kirim hasil ke frontend
  } catch (error) {
    console.error("Error saat mengambil data:", error);
    res.status(500).send("Terjadi kesalahan server");
  }
};

// get all post by user id
export const getPostByUserId = async (req, res) => {
  const userId = new ObjectId(req.params.userId);
  const db = getDb();
  try {
    const collection = db.collection("posts");
    // const result = await collection.find({"userId" : userId}).toArray()
    const match = { $match: { userId: userId } };
    const lookup = {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    };
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
    const result = await collection.aggregate(pipeline).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};

// delete post by post id
export const deletePost = async (req, res) => {
  const postId = new ObjectId(req.params.postId);
  const db = getDb();

  try {
    const deletedPost = await db
      .collection("posts")
      .findOneAndDelete({ _id: postId });
    if (!deletedPost.value)
      return res.status(404).json({ message: "Post tidak ditemukan" });

    res.json({
      message: "Post berhasil dihapus",
      deletedPost: deletedPost.value,
    });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};

export const detailPost = async (req, res) => {
  const postId = new ObjectId(req.params.postId);
  const db = getDb();
  if (!postId) {
    return res.status(401).json({ message: "Tidak diizinkan" });
  }
  const collection = await db.collection("posts")
  const match = {
    $match : { _id : postId}
  }
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


  const lookupComments = {
    $lookup : {
      from : "comments",
      localField : "_id",
      foreignField : "postId",
      as : "comments",
    }
  }

  const sortComments = {
    $addFields: {
      comments: {
        $sortArray: {
          input: "$comments",
          sortBy: { createdAt: -1 }, // -1 untuk DESC, 1 untuk ASC
        },
      },
    },
  };

  const unwindComments = {
    $unwind: {
      path: "$comments",
      preserveNullAndEmptyArrays: true,
    },
  };

  const lookupCommentUser = {
    $lookup: {
      from: "users",
      localField: "comments.userId",
      foreignField: "_id",
      as: "comments.userInfo",
    },
  };

  const unwindCommentUser = {
    $unwind: {
      path: "$comments.userInfo",
      preserveNullAndEmptyArrays: true,
    },
  };

  const groupComments = {
    $group: {
      _id: "$_id",
      title: { $first: "$title" },
      userId: { $first: "$userId" },
      cover: { $first: "$cover" },
      content: { $first: "$content" },
      createdAt: { $first: "$createdAt" },
      userInfo: { $first: "$userInfo" },
      comments: {
        $push: {
          $ifNull: ["$comments", []], // Pastikan jika tidak ada komentar, hasil tetap []
        },
      },
    },
  };

  const projectData = {
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
      comments: {
        $filter: {
          input: "$comments",
          as: "comment",
          cond: { $ne: ["$$comment", {}] }, // Hapus elemen kosong jika ada
        },
      },
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
      "userInfo.firstName" : 1,
      "userInfo.email" : 1,
      "userInfo._id" : 1,
      comments: {
        $filter: {
          input: "$comments",
          as: "comment",
          cond: { $ne: ["$$comment", {}] }, // Hapus elemen kosong jika ada
        },
      },
    },
  };
  
  const pipeline = [
    match, 
    lookupUserInfo, 
    unwindUserInfo, 
    lookupComments,
    sortComments,
    unwindComments,
    lookupCommentUser, 
    unwindCommentUser,
    groupComments,
    rawData]
  ;

  const result = await collection.aggregate(pipeline).toArray()
  if (!result.length) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.json(result[0]);
  try {
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};

// update
export const updatePost = async (req, res) => {
  const { _id, cover, title, content, userId } = req.body;
  const currentUserId = req.params.currentUserId;
  const postId = new ObjectId(_id);
  const db = getDb();

  if (currentUserId !== userId)
    return res.status(401).json({ message: "Unauthorized" });

  try {
    const collection = db.collection("posts");
    const result = await collection.updateOne(
      {
        _id: postId,
      },
      {
        $set: {
          title,
          cover,
          content,
          userId: new ObjectId(userId),
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0)
      return res.status(404).json({ message: "Gagal Diperbarui" });
    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Data tidak berubah" });
    }
    res.status(200).json({ message: "Berhasil diperbarui" });
  } catch (error) {
    res.status(500).send("Internal server errro");
  }
};
