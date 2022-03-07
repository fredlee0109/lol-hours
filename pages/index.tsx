import axios from "axios";
import { GetStaticProps, GetStaticPropsContext } from "next";
import Link from "next/link";
import Layout from "../components/MyLayout";

function ShowLink({ show }) {
  return (
    <li key={show.id}>
      <Link as={`/p/${show.id}`} href={`/post?id=${show.id}`}>
        <a>{show.name}</a>
      </Link>
      <style jsx>{`
        li {
          list-style: none;
          margin: 5px 0;
        }

        a {
          text-decoration: none;
          color: blue;
        }

        a:hover {
          opacity: 0.6;
        }
      `}</style>
    </li>
  );
}

export default function Index(props) {
  return (
    <Layout>
      <h1>Naruto TV Shows</h1>
      <ul>
        {props.shows.map(({ show }) => (
          <ShowLink key={show.id} show={show} />
        ))}
      </ul>
      <style jsx>{`
        h1,
        a {
          font-family: "Arial";
        }

        ul {
          padding: 0;
        }

        li {
          list-style: none;
          margin: 5px 0;
        }

        a {
          text-decoration: none;
          color: blue;
        }

        a:hover {
          opacity: 0.6;
        }
      `}</style>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async (
  context: GetStaticPropsContext
) => {
  const { data } = await axios.get(
    "https://api.tvmaze.com/search/shows?q=naruto"
  );

  console.log(`Show data fetched. Count: ${data.length}`);

  return {
    props: {
      shows: data,
    },
  };
};
