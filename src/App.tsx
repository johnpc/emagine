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
  Link,
} from "@aws-amplify/ui-react";
import { addDays } from "date-fns";
import config from "../amplify_outputs.json";

type OmdbInfo = {
  title: string;
  year: string;
  rated: string | null;
  released: string;
  runtime: string;
  genre: { [key: number]: string };
  director: { [key: number]: string };
  writer: { [key: number]: string };
  actors: { [key: number]: string };
  plot: string;
  language: string;
  country: string;
  awards: string;
  poster: string;
  ratings: { [key: number]: { source: string; value: string } };
  metascore: string;
  imdbrating: string;
  imdbvotes: number;
  imdbid: string;
  type: "movie";
  boxoffice: string;
  website: string;
};
const MovieCard = (props: { movie: Movie; showtimeInfo: ShowtimeInfo[] }) => {
  const { tokens } = useTheme();
  const [omdbInfo, setOmdbInfo] = useState<OmdbInfo>();
  useEffect(() => {
    const setup = async () => {
      const response = await fetch(config.custom.omdbFunction, {
        method: "POST",
        body: JSON.stringify({
          title: props.movie.title,
          year: new Date(props.movie.opening_date).getFullYear(),
        }),
      });
      const json = await response.json();
      console.log({ json });
      setOmdbInfo(json.omdbInfo);
    };
    setup();
  }, [props.movie.opening_date, props.movie.title]);

  const ratings: string[] = omdbInfo?.ratings
    ? Object.values(omdbInfo?.ratings).map((r) => `${r.source}: ${r.value}`)
    : [];

  return (
    <View
      backgroundColor={tokens.colors.background.secondary}
      padding={tokens.space.medium}
    >
      <Card>
        <Flex direction="row" alignItems="flex-start">
          <Image
            alt={props.movie.title + " poster"}
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
            <Text as="div">{omdbInfo?.plot ?? props.movie.excerpt}</Text>
            <Divider />

            <Collection
              items={props.showtimeInfo}
              type="list"
              direction="row"
              gap="20px"
              wrap="wrap"
            >
              {(item) => (
                <Button key={item.showtime}>
                  {new Date(item.showtime).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Button>
              )}
            </Collection>
            <Divider />
            {!props.movie.trailer ? null : (
              <Link href={props.movie.trailer}>Trailer</Link>
            )}
            {omdbInfo?.runtime ? <div>Runtime: {omdbInfo.runtime}</div> : null}
            {omdbInfo?.rated ? <div>Rated: {omdbInfo.rated}</div> : null}
            {ratings.length ? (
              <>
                Ratings:
                {ratings.map((rating) => (
                  <li>{rating}</li>
                ))}
              </>
            ) : null}
            {Object.values(omdbInfo?.actors ?? {}).length ? (
              <>
                Actors:
                {Object.values(omdbInfo?.actors ?? {}).map((actor) => (
                  <li>{actor}</li>
                ))}
              </>
            ) : null}
            {Object.values(omdbInfo?.genre ?? {}).length ? (
              <>
                Genre:
                {Object.values(omdbInfo?.genre ?? {}).map((genre) => (
                  <li>{genre}</li>
                ))}
              </>
            ) : null}
          </Flex>
        </Flex>
      </Card>
    </View>
  );
};
function App() {
  const { tokens } = useTheme();
  const [showtimeInfo, setShowtimeInfo] = useState<ShowtimeInfo[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  useEffect(() => {
    const setup = async () => {
      const s = await getShowtimes(date);
      setShowtimeInfo(s);
    };
    setup();
  }, [date]);

  if (!showtimeInfo.length) return "Loading...";
  const movieIds = showtimeInfo
    .map((s) => s.movie.id)
    .filter((value, index, array) => array.indexOf(value) === index);

  const buttons = [0, 1, 2, 3, 4, 5, 6].map((number) => {
    const day = addDays(new Date(), number);
    return (
      <Button
        key={number}
        marginLeft={tokens.space.small}
        onClick={() => setDate(day)}
      >
        {day.toLocaleDateString(undefined, {
          day: "numeric",
          month: "numeric",
          weekday: "short",
        })}
      </Button>
    );
  });
  return (
    <>
      {buttons}
      {movieIds.map((movieId) => {
        const showtimes = showtimeInfo.filter((s) => s.movie?.id === movieId);
        return (
          <MovieCard
            key={movieId}
            movie={showtimes[0].movie}
            showtimeInfo={showtimes}
          />
        );
      })}
    </>
  );
}

export default App;
