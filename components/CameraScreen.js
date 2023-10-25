import React, { useState, useEffect } from "react";
import {
  View,
  Button,
  Image,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";

export default function CameraScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [locationclick, setLocationclick] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Camera access is required to use this feature");
      }

      const { locationstatus } =
        await Location.requestForegroundPermissionsAsync();
      if (locationstatus !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      } else {
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      setLocationclick(location);

      const { statusGallery } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (statusGallery !== "granted") {
        alert("Gallery access is required to use this feature");
      }
    })();
  }, []);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (locationclick) {
    text = JSON.stringify(locationclick);
  }

  const takeimage = async () => {
    if (cameraRef) {
      const options = { quality: 1, base64: true, exif: true };
      const photo = await cameraRef.takePictureAsync(options);

      const imageWithLocation = {
        ...photo,
        exif: {
          ...photo.exif,
          GPSLatitude: latitude,
          GPSLongitude: longitude,
        },
      };
      setDetails(imageWithLocation);
      setCapturedImage(photo.uri);
      saveImageToLibrary(photo.uri);
      setShowModal(true);
      setShowCamera(false);
    }
  };

  const saveImageToLibrary = async (imageUri) => {
    try {
      const asset = await MediaLibrary.saveToLibraryAsync(imageUri);
      // You can display a success message to the user if needed.
      Alert.alert(
        "Image Saved",
        "The image has been saved to your device.",
        asset
      );
    } catch (error) {
      // Handle any errors that occur during the saving process.
      Alert.alert("Error", "An error occurred while saving the image.");
      console.error(error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setCapturedImage(result.uri);
      setShowModal(true);
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={{ backgroundColor: "lightgray", height: "100%" }}
      >
        <View
          style={{
            marginTop: 250,
            marginLeft: 140,
            marginRight: 140,
          }}
        >
          <Button title="Capture" onPress={() => setShowCamera(true)} />
        </View>
        <View style={{ marginTop: 10, marginLeft: 140, marginRight: 140 }}>
          <Button title="Browse" onPress={pickImage} />
        </View>
      </TouchableOpacity>
      {showCamera && (
        <Modal animationType="slide" visible={showCamera}>
          <Camera
            ref={(ref) => {
              cameraRef = ref;
            }}
            style={{ flex: 1 }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={{
                  marginBottom: 20,
                  padding: 30,
                  backgroundColor: "white",
                  borderRadius: 60,
                }}
                onPress={takeimage}
              ></TouchableOpacity>
            </View>
          </Camera>
        </Modal>
      )}
      {showModal && (
        <Modal animationType="slide" visible={showModal}>
          <Image source={{ uri: capturedImage }} style={{ flex: 1 }} />
          <View>
            <Button
              title="Details"
              onPress={() => {
                setDetails;
              }}
            />
          </View>
          <View>
            <Button title="Close" onPress={() => setShowModal(false)} />
          </View>
        </Modal>
      )}
    </View>
  );
}
