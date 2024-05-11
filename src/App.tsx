import { useEffect, useState } from "react";
import "@aws-amplify/ui-react/styles.css";
import "@fontsource/inter/400.css";
import "./App.css";
import { Movie, ShowtimeInfo, getShowtimes } from "./helpers/getShowtimes";
import {
  Card,
  Image,
  View,
  Heading,
  Flex,
  Badge,
  Text,
  useTheme,
  Divider,
  Button,
  Collection,
} from "@aws-amplify/ui-react";

const MovieCard = (props: { movie: Movie; showtimeInfo: ShowtimeInfo[] }) => {
  const { tokens } = useTheme();
  return (
    <View
      backgroundColor={tokens.colors.background.secondary}
      padding={tokens.space.medium}
    >
      <Card>
        <Flex direction="row" alignItems="flex-start">
          <Image
            alt="Road to milford sound"
            src={props.movie.poster}
            width="20%"
          />
          <Flex
            maxWidth={"75%"}
            direction="column"
            alignItems="flex-start"
            gap={tokens.space.xs}
          >
            <Flex>
              <Badge size="small" variation="info">
                {props.movie.rating}
              </Badge>
              <Badge size="small" variation="success">
                {props.movie.runtime}
              </Badge>
            </Flex>

            <Heading level={5}>{props.movie.title}</Heading>

            <Divider />
            <Text as="div">{props.movie.excerpt}</Text>
            <Divider />

            <Collection
              items={props.showtimeInfo}
              type="list"
              direction="row"
              gap="20px"
              wrap="wrap"
            >
              {(item) => (
                <Button>
                  {new Date(item.showtime).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Button>
              )}
            </Collection>
          </Flex>
        </Flex>
      </Card>
    </View>
  );
};
function App() {
  const [showtimeInfo, setShowtimeInfo] = useState<ShowtimeInfo[]>([]);
  useEffect(() => {
    const setup = async () => {
      const s = await getShowtimes();
      setShowtimeInfo(s);
    };
    setup();
  }, []);

  if (!showtimeInfo.length) return "Loading...";
  const movieIds = showtimeInfo
    .map((s) => s.movie.id)
    .filter((value, index, array) => array.indexOf(value) === index);

  return (
    <>
      {movieIds.map((movieId) => {
        const showtimes = showtimeInfo.filter((s) => s.movie.id === movieId);
        return (
          <MovieCard movie={showtimes[0].movie} showtimeInfo={showtimes} />
        );
      })}
    </>
  );
}

export default App;
