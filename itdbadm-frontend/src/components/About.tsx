// src/components/AboutPage.tsx
import { Link } from "@heroui/link";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";

const AboutPage = () => {
  const features = [
    {
      title: "Band Discovery",
      description:
        "Find and connect with talented bands across various genres and locations.",
    },
    {
      title: "Easy Booking",
      description:
        "Streamline the booking process with our intuitive offer and scheduling system.",
    },
    {
      title: "Transparent Pricing",
      description:
        "Clear pricing and offer management for both bands and event organizers.",
    },
    {
      title: "Community Driven",
      description:
        "Build relationships between bands, venues, and music enthusiasts.",
    },
  ];

  const techStack = [
    {
      name: "React",
      description: "Frontend library for building responsive user interfaces",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/2300px-React-icon.svg.png",
      color: "border-blue-400 dark:border-blue-600",
    },
    {
      name: "Bun.sh",
      description: "Fast all-in-one JavaScript runtime and package manager",
      image: "/src/logo-centered.svg",
      color: "border-gray-400 dark:border-gray-600",
    },
    {
      name: "Elysia.js",
      description:
        "High-performance Bun web framework with end-to-end type safety",
      image: "https://elysiajs.com/assets/elysia.svg",
      color: "border-purple-400 dark:border-purple-600",
    },
    {
      name: "MySQL",
      description:
        "Reliable relational database for structured data management",
      image:
        "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/mysql-icon.png",
      color: "border-blue-600 dark:border-blue-400",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
          <span className="text-2xl">🎵</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          About Band N Brand
        </h1>
        <p className="text-xl text-default-600 max-w-3xl mx-auto mb-8">
          Connecting the music community through seamless booking experiences
          and powerful tools for bands, venues, and event organizers.
        </p>
      </div>

      {/* Mission Section */}
      <Card className="mb-16">
        <CardBody className="p-8 md:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-default-600 mb-6">
                Band N Brand was born from a simple observation: the music
                booking industry needed modernization. Traditional methods of
                connecting bands with venues were fragmented, inefficient, and
                often left talented musicians struggling to find opportunities.
              </p>
              <p className="text-lg text-default-600 mb-8">
                We're building a platform that empowers musicians to focus on
                what they do best—creating music—while we handle the business
                side of bookings, offers, and scheduling.
              </p>
              <Button color="primary" variant="flat">
                Learn More
              </Button>
            </div>
            <div className="bg-default-100 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                What We Offer
              </h3>
              <ul className="space-y-4 text-default-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Streamlined offer management system
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Real-time booking status tracking
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Secure payment processing
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Comprehensive band profiles
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Venue and event management
                </li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Features Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Key Features
          </h2>
          <p className="text-default-600 max-w-2xl mx-auto">
            Everything you need to manage your music bookings and grow your
            brand
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none bg-content1 shadow-medium">
              <CardBody className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-lg">✨</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-default-600 text-sm">
                  {feature.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Our Tech Stack
          </h2>
          <p className="text-default-600 max-w-2xl mx-auto">
            Built with modern technologies for performance, reliability, and
            scalability
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStack.map((tech, index) => (
            <Card key={index} className={`border-2 ${tech.color} bg-content1`}>
              <CardBody className="p-6 text-center">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Image
                    src={tech.image}
                    alt={tech.name}
                    className="w-12 h-12 object-contain"
                    removeWrapper
                  />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {tech.name}
                </h3>
                <p className="text-default-600 text-sm">{tech.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Why This Stack Section */}
      <Card className="mb-16">
        <CardBody className="p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why We Chose This Stack
            </h2>
            <Divider className="my-6" />
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Performance & Developer Experience
              </h3>
              <p className="text-default-600 mb-6">
                Our choice of Bun.sh and Elysia.js ensures exceptional
                performance and a delightful developer experience. Bun's speed
                combined with Elysia's type-safe API development allows us to
                build features faster while maintaining code quality.
              </p>
              <p className="text-default-600">
                React provides the interactive, responsive user interface that
                our users deserve, while MySQL offers the reliability and
                structure needed for complex booking and user data.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Future-Proof Architecture
              </h3>
              <p className="text-default-600 mb-6">
                This modern stack positions us for rapid iteration and scaling.
                The Bun ecosystem is growing rapidly, and we're excited to be
                early adopters of these cutting-edge technologies.
              </p>
              <p className="text-default-600">
                From real-time booking updates to seamless payment processing,
                our stack provides the foundation for all the features our music
                community needs.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* CTA Section */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-none">
        <CardBody className="p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-default-600 mb-8 max-w-2xl mx-auto">
            Join thousands of bands and organizers already using Band N Brand to
            streamline their music booking process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              href="/offers"
              color="primary"
              size="lg"
              className="font-semibold"
            >
              Browse Offers
            </Button>
            <Button
              as={Link}
              href="/profile"
              variant="flat"
              size="lg"
              className="font-semibold"
            >
              Create Account
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AboutPage;
