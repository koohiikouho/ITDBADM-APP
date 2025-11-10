import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";

import HomeLayout from "@/layouts/home";

import FallingText from "@/components/FallingText";

export default function IndexPage() {
  return (
    <HomeLayout>
      <div className="h-70">
        <FallingText
          text={` Put the Brand i n your Band `}
          highlightWords={["Brand", "n", "Band"]}
          trigger="hover"
          backgroundColor="transparent"
          wireframes={false}
          gravity={0.1}
          fontSize="6rem"
          mouseConstraintStiffness={0.1}
        />
      </div>
      <div className="justify-center flex">
        <p>Lorem Ipsum</p>
      </div>
    </HomeLayout>
  );
}
