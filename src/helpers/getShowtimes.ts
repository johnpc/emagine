const infoUrl =
  "https://www.emagine-entertainment.com/wp-json/emagine/v1/theatres/3677/sessions/?date=&movie_id=";
export type Movie = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  opening_date: string;
  poster: string;
  rating: string;
  runtime: string;
  now_showing: boolean;
  trailer?: string;
};

export type ShowtimeInfo = {
  showtime: string;
  movie: Movie;
};
export const getShowtimes = async (date: Date): Promise<ShowtimeInfo[]> => {
  const response = await fetch(infoUrl);
  const json = await response.json();
  const moviesNowShowing = (Object.values(json.data.movies) as Movie[]).filter(
    (movie: Movie) => movie.now_showing || true,
  );
  const today = date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
  const [month, day, year] = today.split("/");
  const todayKey = `${year}-${month}-${day}`;
  const sessionsForDate = Object.values(json.data.sessions_by_theatre)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((t: any) => t.business_dates)
    .find((t) => t);
  const groups = Object.values(sessionsForDate[todayKey])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((g: any) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      g.groups.map((group: any) => ({
        ...group,
        movieId: g.movie_id,
      })),
    )
    .flat();

  const sessions = groups
    .map((g) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      g.sessions.map((sesh: any) => ({ ...sesh, movieId: g.movieId })),
    )
    .flat();
  const showtimeInfo = sessions
    .map((sesh) => {
      const movie = moviesNowShowing.find((movie) => sesh.movieId === movie.id);
      return {
        ...sesh,
        movieName: movie?.title,
        movie,
        showtime: new Date(sesh.showtime).toLocaleString(),
      };
    })
    .sort(
      (a, b) => new Date(a.showtime).getTime() - new Date(b.showtime).getTime(),
    );

  return showtimeInfo;
};
