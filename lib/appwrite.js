import {
  Client,
  Account,
  ID,
  Avatars,
  Databases,
  Query,
  Storage,
} from "react-native-appwrite";
// import { Query } from "react-native-appwrite";
export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.radiant.auraa",
  projectId: "672388e800064ca6668a",
  databaseId: "67238bf100159232dcd9",
  userCollectionId: "67238c32000d65addfad",
  videosCollectionId: "67238c5f002cf057838a",
  auraFilesStorageId: "67238fe40036488527cf",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videosCollectionId,
  auraFilesStorageId,
} = appwriteConfig;

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);
    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export const getAccount = async () => {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const getAllPost = async () => {
  try {
    const res = await databases.listDocuments(databaseId, videosCollectionId);

    return res.documents;
  } catch (err) {
    throw new Error(err);
  }
};

export const getTrendingPost = async () => {
  try {
    const res = await databases.listDocuments(databaseId, videosCollectionId, [
      Query.orderDesc("$createdAt", Query.limit(7)),
    ]);

    return res.documents;
  } catch (err) {
    throw new Error(err);
  }
};

export const getUserPost = async (userId) => {
  try {
    const res = await databases.listDocuments(databaseId, videosCollectionId, [
      Query.equal("users", userId),
    ]);

    return res.documents;
  } catch (err) {
    throw new Error(err);
  }
};

export const searchPost = async (query) => {
  try {
    const res = await databases.listDocuments(databaseId, videosCollectionId, [
      Query.search("Title", query),
    ]);

    return res.documents;
  } catch (err) {
    throw new Error(err);
  }
};

export const getFilePrevoiew = async (fileId, type) => {
  let fileUrl;

  try{
    if(type === 'video') {
      fileUrl = storage.getFileView(auraFilesStorageId, fileId)
    } else if ( type === 'image') {
      fileUrl = storage.getFilePreview(auraFilesStorageId, fileId, 2000,2000,'top', 100)
    } else {
      throw new Error("Invalid file type");
    }

    if(!fileUrl) throw Error;

    return fileUrl;

  }catch (err) {
    throw new Error(err);
    
  }
}

export const uploadFile = async (file, type) => {
  if (!file) return;

  const { mimeType, ...rest } = file;
  const asset = { type: mimeType, ...rest };

  try {
    const uploadedFile = await storage.createFile(
      auraFilesStorageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePrevoiew(uploadedFile.$id, type)

    return fileUrl;
  } catch (err) {
    throw new Error(err);
  }
};

export const uploadVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, "image"),
      uploadFile(form.video, "video"),
    ]);

    const newPost = await databases.createDocument( databaseId, videosCollectionId, ID.unique(), {
      title: form.title,
      thumbnail: thumbnailUrl,
      video: videoUrl,
      prompt: form.prompt,
      user: form.userId
    })

    return newPost;
  } catch (err) {
    throw new Error(err);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (err) {
    throw new Error(err);
  }
};
