import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { styles } from "./styles";

export default function Depense() {
  const [budget, setBudget] = useState(1280720);
  const [newProduct, setNewProduct] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const defaultTransactions = [
      {
        id: 1,
        item: "Téléviseur",
        category: "Électronique",
        price: 500000,
        description: "Nouveau téléviseur pour le salon",
      },
      {
        id: 2,
        item: "Canapé",
        category: "Mobilier",
        price: 800000,
        description: "Canapé confortable pour la salle de séjour",
      },
    ];
    setTransactions(defaultTransactions);
  }, []);

  const handleAddProduct = () => {
    const price = parseInt(newProductPrice);
    if (!isNaN(price) && price > 0) {
      const updatedBudget = budget - price;
      if (updatedBudget >= 0) {
        setBudget(updatedBudget);

        const newTransaction = {
          item: newProduct,
          price: price,
          description: newProductDescription,
        };
        setTransactions((prevTransactions) => [
          ...prevTransactions,
          newTransaction,
        ]);

        setNewProduct("");
        setNewProductPrice("");
        setNewProductDescription("");

        setModalVisible(false);
      } else {
        alert("Le budget n'est pas suffisant !");
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <View style={styles.container}>
          {/*--------------------------- Card du nav bar --------------------------- */}
          <View
            style={{
              backgroundColor: "#76CE9E",
              marginTop: 42,
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
                  Dépense
                </Text>
                <Text style={{ color: "white", marginTop: 5, fontSize: 12 }}>
                  La somme restante pour notre maison
                </Text>
                <Text
                  style={{
                    color: "white",
                    marginTop: 5,
                    fontWeight: "bold",
                    fontSize: 21,
                    width: 200,
                  }}
                >
                  {budget} MGA
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
                  source={require("./images/depense.png")}
                  style={{ width: 160, height: 160 }}
                />
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginTop: 9,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#F9C877",
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 11,
                }}
              >
                <Text style={{ color: "white" }}>Notification</Text>
              </TouchableOpacity>
              <View
                style={{
                  backgroundColor: "white",
                  width: 135,
                  height: 1,
                  borderColor: "white",
                }}
              ></View>
              <Image
                source={require("./images/info.png")}
                style={{ width: 15, height: 15 }}
              />
            </View>
          </View>
          {/*--------------------------- Apres le nav bar --------------------------- */}

          <View
            style={{
              flexDirection: "row",
              marginTop: 25,
              alignItems: "center",
              justifyContent: "space-between",
              marginHorizontal: "3%",
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{ color: "#76CE9E", fontWeight: "bold", fontSize: 16 }}
              >
                Dépense
              </Text>
              <Text style={{ color: "#76CE9E", marginLeft: 5, fontSize: 16 }}>
                dans la maison
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#76CE9E",
                width: 100,
                height: 1,
                marginRight: 50,
                marginTop: 3,
                borderColor: "white",
              }}
            ></View>
          </View>

          <View>
            {transactions.map((transaction, index) => (
              <View key={index} style={styles.container1}>
                <Text style={styles.name}>{transaction.item}</Text>
                <Text style={styles.name2}>{transaction.description}</Text>
                <Text
                  style={{
                    paddingBottom: 13,
                    fontSize: 14,
                    fontWeight: "bold",
                    marginLeft: 20,
                    color: "#fff",
                  }}
                >
                  {transaction.price} MGA
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.floatingButton}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalView}>
          <Text style={{ fontSize: 20, paddingBottom: 20, paddingTop: 20 }}>
            Ajouter un nouveau produit
          </Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setNewProduct(text)}
            value={newProduct}
            placeholder="  Nom du nouveau produit"
          />
          <TextInput
            style={styles.input}
            onChangeText={(text) => setNewProductPrice(text)}
            value={newProductPrice}
            keyboardType="numeric"
            placeholder="  Prix du nouveau produit"
          />
          <TextInput
            style={styles.input}
            onChangeText={(text) => setNewProductDescription(text)}
            value={newProductDescription}
            placeholder="  Description du nouveau produit"
          />
          <TouchableOpacity onPress={handleAddProduct} style={styles.addButton}>
            <Text style={{ color: "white" }}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
}
