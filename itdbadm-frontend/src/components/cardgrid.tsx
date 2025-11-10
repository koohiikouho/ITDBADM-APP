/* eslint-disable prettier/prettier */
import React from "react";
import { Card, CardHeader, CardBody, Image } from "@heroui/react";
import { CardItem } from "../types/types.ts";
import { useNavigate } from "react-router-dom";

// this part is AI generated but should be tweaked lol

const CardGrid: React.FC = () => {
  // Your card data with TypeScript typing
  const cardData: CardItem[] = [
    {
      id: 1,
      title: "Kessoku Band",
      description:
        "From Bocchi the Rock! - A high school band featuring the socially anxious Hitori Gotō as lead guitarist.",
      image:
        "https://i.discogs.com/BMjajOwTBf2TAm2Z-Oe_pSPqFjRvfpnK3AAEJf_rIdo/rs:fit/g:sm/q:90/h:337/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9BLTEyMjgz/NTQ5LTE2NzM1MzIx/MDMtNzM1OS5qcGVn.jpeg",
    },
    {
      id: 2,
      title: "Girls Dead Monster",
      description:
        "From Angel Beats! - A band formed in the afterlife, performing rock music to reach the hearts of students.",
      image:
        "https://i.discogs.com/60rBt_Ogu736vgrrTjgBg-tGV1NVraqhihFNl1Ca52k/rs:fit/g:sm/q:90/h:353/w:500/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9BLTQ0Mzg4/MzMtMTQzNjIwOTg1/NS0yODI5LmpwZWc.jpeg",
    },
    {
      id: 3,
      title: "Afterglow",
      description:
        "From BanG Dream! - A band of childhood friends who play powerful rock music together.",
      image:
        "https://i.bandori.party/u/asset/Q0lA5TBedroom-Afterglow-aMfppm.png",
    },
    {
      id: 4,
      title: "Poppin'Party",
      description:
        "From BanG Dream! - The main band known for their cheerful pop-rock sound and energetic performances.",
      image:
        "https://espguitars.co.jp/wp-content/uploads/2020/08/poppinparty_202303.jpg",
    },
    {
      id: 5,
      title: "Roselia",
      description:
        "From BanG Dream! - A gothic-style band known for their professional-level skills and dramatic performances.",
      image:
        "https://upload.wikimedia.org/wikipedia/en/d/d3/Roselia_BanG_Dream_Girls_Band_Party.png",
    },
    {
      id: 6,
      title: "RAISE A SUILEN",
      description:
        "From BanG Dream! - An intense electronic rock band known for their powerful sound and technical proficiency.",
      image:
        "https://bang-dream.bushimo.jp/raise-a-suilen/assets/images/common/ogp_01.png",
    },
    {
      id: 7,
      title: "Morfonica",
      description:
        "From BanG Dream! - A band that incorporates violin into their rock sound, creating a unique musical style.",
      image:
        "https://upload.wikimedia.org/wikipedia/en/4/49/Morfonica_BanG_Dream_art.jpg",
    },
    {
      id: 8,
      title: "MyGO!!!!!",
      description:
        "From BanG Dream! - A band formed through complicated relationships, known for their emotional performances.",
      image:
        "https://lh3.googleusercontent.com/Atk5OqGN7c0rncsz6FWt6ct0yK0MEji3m8VkYFq4v1V3jp9vjRw-T43L4xs1J8FA18Y8sg1fs0L0ot4=w2880-h1200-p-l90-rj",
    },
    {
      id: 9,
      title: "Ave Mujica",
      description:
        "From BanG Dream! - A mysterious band with a dark, theatrical style and occult themes.",
      image:
        "https://i.bandori.party/u/asset/r2hkX7Anime-Key-Visual-Ave-Mujica-ZdfRoG.jfif",
    },
    {
      id: 10,
      title: "Ho-kago Tea Time",
      description:
        "From K-ON! - The iconic light music club band known for their fun, pop-oriented songs and slice-of-life adventures.",
      image:
        "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 11,
      title: "SOS Brigade Band",
      description:
        "From The Melancholy of Haruhi Suzumiya - The unofficial band formed by Haruhi and friends for the school festival.",
      image:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 12,
      title: "Black Heaven",
      description:
        "From Detroit Metal City - A death metal band with an outrageous stage persona contrasting their normal daily lives.",
      image:
        "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 13,
      title: "The Girls' Rock Club",
      description:
        "From Show by Rock!! - Bands of girl musicians in a world where music has magical powers.",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 14,
      title: "Fukashigi no Carte",
      description:
        "From Rascal Does Not Dream of Bunny Girl Senpai - The band that performs the series' iconic ending theme.",
      image:
        "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 15,
      title: "Crescent Moon Band",
      description:
        "From Carole & Tuesday - A band formed by two girls from different backgrounds creating music on Mars.",
      image:
        "https://images.unsplash.com/photo-1571974599782-87624638275f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 16,
      title: "The Zodiac Signs",
      description:
        "From Given - Bands featured in this BL anime about music, relationships, and emotional healing through rock.",
      image:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 17,
      title: "Togenashi Togeari",
      description:
        "From Nana - Bands in the story of two women both named Nana and their connections to the music world.",
      image:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 18,
      title: "Rin!",
      description:
        "From Tari Tari - A choir club that evolves into performing band arrangements with passionate energy.",
      image:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 19,
      title: "ST☆RISH",
      description:
        "From Uta no Prince-sama - An idol band of handsome male singers competing in the music industry.",
      image:
        "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 20,
      title: "Plasmagica",
      description:
        "From Show by Rock!! - A rookie band consisting of a cat, dog, sheep, and alien working toward their dreams.",
      image:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    },
  ];

  const navigate = useNavigate();

  const handleCardPress = (itemId: number): void => {
    console.log("Card pressed", itemId);
    navigate("/bandinfo");
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
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-300">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
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
