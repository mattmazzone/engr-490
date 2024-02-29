import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

interface CategoryViewProps {
  category: {
    name: string;
    items: { id: string }[];
  };
  selectedInterests: string[];
  onSelectInterest: (id: string) => void;
  theme: string | null;
}

const CategoryView = ({
  category,
  selectedInterests,
  onSelectInterest,
  theme,
}: CategoryViewProps) => {
  return (
    <View key={category.name} style={styles.categoryContainer}>
      <Text
        style={[
          styles.categoryTitle,
          { color: theme === "Dark" ? "white" : "black" },
        ]}
      >
        {category.name}
      </Text>
      <View style={styles.interestsRow}>
        {category.items.map((subcategory) => (
          <Pressable
            key={subcategory.id}
            style={[
              styles.interestButton,
              selectedInterests.includes(subcategory.id)
                ? styles.selectedInterestButton
                : null,
            ]}
            onPress={() => onSelectInterest(subcategory.id)}
            accessibilityLabel={`Select ${subcategory.id}`}
          >
            <Text
              style={[
                styles.interestButtonText,
                { color: 'black' },
              ]}
            >
              {subcategory.id}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginBottom: 20,
    width: "100%",
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  interestsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestButtonText: {
    textAlign: "center",
  },
  selectedInterestButton: {
    backgroundColor: "rgba(34, 170, 85, 1)",
  },
  interestButton: {
    padding: 10,
    borderWidth: 2,
    backgroundColor: "white",
    borderRadius: 20,
    margin: 5,
  },
});

export default CategoryView;
