import Layout from "../components/MyLayout";
import Link from "next/link";

import axios from "axios";
import { useEffect } from "react";
import { GetStaticProps, GetStaticPropsContext } from "next";

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
  useEffect(() => {
    axios.get("/test").then((res) => {
      console.log("FRED", res, res.data);
    });
  }, []);

  return (
    <Layout>
      <h1>Batman TV Shows</h1>
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
    "https://api.tvmaze.com/search/shows?q=batman"
  );

  console.log(`Show data fetched. Count: ${data.length}`);

  return {
    props: {
      shows: data,
    },
  };
};
