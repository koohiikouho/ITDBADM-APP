/* eslint-disable prettier/prettier */
import React from "react";
import { Card, CardHeader, CardBody, Image } from "@heroui/react";
import { CardItem } from "..\types\types.ts";

// this part is AI generated but should be tweaked lol

const CardGrid: React.FC = () => {
  // Your card data with TypeScript typing
  const cardData: CardItem[] = [
    {
      id: 1,
      title: "Mountain Landscape",
      description:
        "Beautiful mountain scenery with lakes and forests. Perfect for nature lovers and outdoor enthusiasts.",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 2,
      title: "Beach Sunset",
      description:
        "Stunning beach sunset with golden hour lighting. Capture the perfect moment of tranquility.",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 3,
      title: "City Skyline",
      description:
        "Modern city skyline at night with illuminated buildings and vibrant city life.",
      image:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 4,
      title: "Forest Path",
      description:
        "Serene forest path surrounded by tall trees and lush greenery. A peaceful escape.",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 5,
      title: "Desert Dunes",
      description:
        "Vast desert landscape with rolling sand dunes under a clear blue sky.",
      image:
        "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 6,
      title: "Northern Lights",
      description:
        "Magical aurora borealis dancing in the night sky over snowy mountains.",
      image:
        "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
  ];

  const handleCardPress = (itemId: number): void => {
    console.log("Card pressed", itemId);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardData.map((item: CardItem) => (
          <Card
            key={item.id}
            isPressable
            className="hover:scale-105 transition-transform duration-200 shadow-lg"
            onPress={() => handleCardPress(item.id)}
          >
            <CardHeader className="p-0">
              <Image
                removeWrapper
                alt={item.title}
                className="w-full h-48 object-cover"
                src={item.image}
              />
            </CardHeader>
            <CardBody className="p-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.description}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CardGrid;
