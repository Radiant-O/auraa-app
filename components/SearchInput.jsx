import { View, Text, TextInput, TouchableOpacity, Image, Alert} from "react-native";
import { useState } from "react";

import { icons } from "../constants";
import { router, usePathname } from "expo-router";
// import { Query } from "react-native-appwrite";

const SearchInput = ( initialQuery ) => {
  const pathname = usePathname();
  const [query, setQuery] = useState( initialQuery || "");
  //   const [showPassword, setshowPassword] = useState(false);
  return (
    <View
      className=" border-2 border-black-200 w-full h-14 px-4 
      bg-black-100 rounded-lg space-x-4 focus:border-secondary items-center flex-row"
    >
      <TextInput
        className="flex-1 text-white font-pregular text-base mt-0.5"
        value={query}
        placeholder="Search for a video"
        placeholderTextColor="#CDCDE0"
        onChangeText={(e) => setQuery(e)}
      />
      <TouchableOpacity
        onPress={() => {
          if (!query) {
            return Alert.alert("Please enter a keyword");
          }

          if (pathname.startsWith("/search")) router.setParams({ query });
          else router.push(`/search/${query}`);
        }}
      >
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
