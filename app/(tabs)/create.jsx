import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../../components/formField";
import { ResizeMode, Video } from "expo-av";
import { icons } from "../../constants";
import CustomButtom from "../../components/CustomButtom";
// import * as DocumentPicker from 'expo-document-picker';  
import { router } from "expo-router";
import { uploadVideo } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider'
import * as ImagePicker from "expo-image-picker"

const Create = () => {
  const { user } = useGlobalContext(); 

  console.log(user)

  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    video: null,
    thumbnail: null,
    prompt: "",
  });

  const openPicker = async (selectType) => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: selectType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      aspect: [4, 3],
      quality:1
    })

    if (!res.canceled) {
      if(selectType === 'image'){
        setForm({ ...form, thumbnail: res.assets[0]})
      }
      if(selectType === 'video'){
        setForm({ ...form, video: res.assets[0]})
      }
    }
    // else {
    //   setTimeout(() => {
    //     Alert.alert('Document selected', JSON.stringify(res, null, 2))
    //   }, 100)
    // }
  }

  const submit = ( async () => {
    if(!form.video || form.prompt === '' || form.title === "" || !form.thumbnail){
      return Alert.alert('Please fill in all the fields')
    }

    setUploading(true)

    try{
      await uploadVideo( {...form, userId: user.$id});
      
      Alert.alert('Success', "Post uploaded successfully")
      router.push('/home');
    } catch (err) {
        Alert.alert('Error', err.message)
        throw new Error(err);
    } finally {
      setForm({
        title: "",
        video: null,
        thumbnail: null,
        prompt: "",
      })
    }
  })

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">Upload Video</Text>

        <FormField
          title="Videe Title"
          value={form.title}
          placeholder="Add Title"
          handleChangeText={(e) =>
            setForm({
              ...form,
              title: e,
            })
          }
          otherStyles="mt-10"
        />
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Upload Video
          </Text>

          <TouchableOpacity onPress={() => openPicker('video')}>
            {form.video ? (
              <Video
                source={{ uri: form.video.uri }}
                className="w-full h-64 rounded-2xl"
                resizeMode={ResizeMode.COVER}
              />
            ) : (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
                <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                  <Image
                    source={icons.upload}
                    resizeMode="contain"
                    className="w-1/2 h-1/2"
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Thumbnail Image
          </Text>

          <TouchableOpacity onPress={() => openPicker('image')}>
            {form.thumbnail ? (
              <Image
                source={{ uri: form.thumbnail.uri }}
                resizeMode="cover"
                className="w-full h-64 rounded-2xl"
              />
            ) : (
              <View
                className="w-full h-16 px-4 bg-black-100 
              rounded-2xl justify-center items-center
               border-2 border-black-200 flex-row space-x-2"
              >
                <Image
                  source={icons.upload}
                  resizeMode="contain"
                  className="w-5 h-5"
                />
                <Text className="text-sm text-gray-100 font-pmedium">
                  Choose a fiile
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FormField
          title="Video AI Prompt"
          value={form.prompt}
          placeholder="Enter Prompt used to generate AI video"
          handleChangeText={(e) =>
            setForm({
              ...form,
              prompt: e,
            })
          }
          otherStyles="mt-7"
        />

        <CustomButtom
        title="Submit & Publish"
        handlePress={submit}
        containerStyles='mt-7'
        isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;
