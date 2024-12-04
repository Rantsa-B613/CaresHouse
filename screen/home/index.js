import React, { useState, useEffect, useRef } from "react";
import { Card } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import {
  StatusBar,
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Button,
  Platform,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // Importer useFocusEffect depuis React Navigation
import Map from "./map";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [showMap, setShowMap] = useState(false);
  const navigation = useNavigation();
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationDescription, setNotificationDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token))
      .catch((error) => console.error("Failed to get push token:", error));
    loadNotifications().catch((error) =>
      console.error("Error loading notifications:", error)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // Afficher une alerte ou une autre action en cas de réception de notification
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    saveNotifications().catch((error) =>
      console.error("Error saving notifications:", error)
    );
  }, [notifications]);

  useFocusEffect(
    React.useCallback(() => {
      const refreshNotifications = async () => {
        await loadNotifications();
      };

      refreshNotifications();

      return () => {};
    }, [])
  );

  const loadNotifications = async () => {
    const storedNotifications = await AsyncStorage.getItem("notifications");
    if (storedNotifications !== null) {
      setNotifications(JSON.parse(storedNotifications));
    }
  };

  const saveNotifications = async () => {
    await AsyncStorage.setItem("notifications", JSON.stringify(notifications));
  };

  async function schedulePushNotification() {
    setIsLoading(true);

    const currentDate = new Date();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationTitle,
        body: `${notificationDescription} \n - Envoyé par ${firstName} ${lastName} le \n ${currentDate}`,
        data: { data: "goes here" },
      },
      trigger: { date: selectedDate },
    }).catch((error) =>
      console.error("Failed to schedule notification:", error)
    );

    const newNotification = {
      request: {
        content: {
          title: notificationTitle,
          body: `${notificationDescription} \n - Envoyé par ${firstName} ${lastName} le \n ${currentDate}`,
          data: { data: "goes here" },
        },
        trigger: {
          date: selectedDate.getTime(),
        },
      },
    };

    setNotifications((prevNotifications) => [
      ...prevNotifications,
      newNotification,
    ]);

    setIsLoading(false);
  }

  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
      console.error("Must use physical device for Push Notifications");
      return;
    }

    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.error("Failed to get push token for push notification!");
      return;
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "e0f1f157-a4e0-48fc-aa11-0602a7b882c6",
      })
    ).data;

    return token;
  }

  const handleDeleteNotification = async (index) => {
    const updatedNotifications = [...notifications];

    updatedNotifications.splice(index, 1);

    setNotifications(updatedNotifications);

    try {
      await AsyncStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error("Error saving notifications:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#CFA875" }}>
      <ScrollView>
        <View style={styles.container}>
          {/*--------------------------- Text au top du nav bar --------------------------- */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ width: "56%" }}>
              <Text style={{ color: "white", fontSize: 15 }}>Bonjour ! </Text>
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
              >
                Prenons soins de notre maison ensemble ✨{" "}
              </Text>
            </View>
            <View
              style={{
                marginLeft: "5%",
                backgroundColor: "#848B66",
                height: 45,
                width: 45,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 11,
                marginTop: 15,
              }}
            >
              <Image
                source={require("./images/profile.png")}
                style={{ width: 15, height: 15 }}
              />
            </View>
          </View>
          {/*--------------------------- Card du nav bar --------------------------- */}
          <View
            style={{
              backgroundColor: "#F9C877",
              marginTop: 25,
              padding: 20,
              borderRadius: 9,
            }}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <View style={{ width: "40%" }}>
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 21 }}
                >
                  Notification
                </Text>
                <Text style={{ color: "white", marginTop: 5 }}>
                  Laisser votre maison vous aider
                </Text>
              </View>
              <View
                style={{
                  position: "absolute",
                  top: -70,
                  right: 0,
                  bottom: 150,
                }}
              >
                <Image
                  source={require("./images/house1.png")}
                  style={{ width: 160, height: 160 }}
                />
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginTop: 15,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#848B66",
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 11,
                }}
              >
                <Text style={{ color: "white" }}>Note de maison</Text>
              </TouchableOpacity>
              <View
                style={{
                  backgroundColor: "white",
                  width: 135,
                  height: 1,
                  bordeColor: "white",
                }}
              ></View>
              <Image
                source={require("./images/info.png")}
                style={{ width: 15, height: 15 }}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginTop: 25,
              alignItems: "center",
              justifyContent: "space-between",
              marginHorizontal: "2%",
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 19 }}
              >
                Rappel
              </Text>
              <Text style={{ color: "white", marginLeft: 5, fontSize: 19 }}>
                importante
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "white",
                width: 115,
                height: 1,
                marginTop: 3,
                borderColor: "white",
              }}
            ></View>
            <Image
              source={require("./images/info.png")}
              style={{ width: 15, height: 15 }}
            />
          </View>
          <View
            style={{
              width: "100%",
              height: 100,
              paddingHorizontal: "3%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                marginTop: "10%",
                height: "100%",
                width: "100%",
                marginBottom: "5%",
                borderRadius: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: "5%",
              }}
            >
              <View
                style={{
                  width: "80%",
                  height: "100%",
                  paddingTop: "5%",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 20,
                    }}
                  >
                    Lumière
                  </Text>
                </View>
                <View>
                  <Text>Vous devrez chaner vos empoules</Text>
                </View>
                <View>
                  <Text>Prévu expirer le : 26-03-2024</Text>
                </View>
              </View>

              <View>
                <TouchableOpacity onPress={() => setShowMap(true)}>
                  <MaterialIcons name="light" size={25} color="#848B66" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View
            style={{
              width: "100%",
              height: 100,
              paddingHorizontal: "3%",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "6%",
              marginBottom: "3%",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                marginTop: "10%",
                height: "100%",
                width: "100%",
                marginBottom: "5%",
                borderRadius: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: "5%",
              }}
            >
              <View
                style={{
                  width: "80%",
                  height: "100%",
                  paddingTop: "5%",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 20,
                    }}
                  >
                    Climatiseur
                  </Text>
                </View>
                <View>
                  <Text>Entretient rappel</Text>
                </View>
                <View>
                  <Text>Prévu expirer le : 26-03-2024</Text>
                </View>
              </View>

              <View>
                <TouchableOpacity onPress={() => setShowMap(true)}>
                  <MaterialIcons name="cloud" size={25} color="#848B66" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Modal
            visible={showMap}
            animationType="slide"
            onRequestClose={() => setShowMap(false)}
          >
            <View style={{ flex: 1 }}>
              <Map />
            </View>
          </Modal>

          <View style={{ marginRight: "6.5%", marginTop: "3%" }}>
            {notifications
              .filter((notification) => {
                const notificationDate = new Date(
                  notification?.request?.trigger?.date
                );
                const currentDate = new Date();
                const differenceInDays = Math.ceil(
                  (notificationDate - currentDate) / (1000 * 60 * 60 * 24)
                );
                return differenceInDays <= 5;
              })
              .slice(0)
              .reverse()
              .map((notification, index) => (
                <Card
                  key={index}
                  style={{
                    margin: 10,
                    padding: 10,
                    backgroundColor: "#fff",
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: "black",
                          fontSize: 20,
                        }}
                      >
                        {notification?.request?.content?.title || "No title"}
                      </Text>
                      <Text style={{ color: "black" }}>
                        {notification?.request?.content?.body || "No body"}
                      </Text>
                      <Text style={{ color: "black" }}>
                        Date prévue:{" "}
                        {new Date(
                          notification?.request?.trigger?.date
                        ).toLocaleString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteNotification(index)}
                    >
                      <MaterialIcons name="delete" size={25} color="#848B66" />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
          </View>

          <StatusBar style="auto" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CFA875",
    marginHorizontal: "4%",
    marginTop: 45,
  },
});
