import axios from "axios";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";

interface Data {
  region: string;
  id: string;
}

export default function Post(props: Data) {
  const [response, setResponse] = useState([]);

  useEffect(() => {
    axios
      .get(`../../api/hours/${props.region}/${props.id}`)
      .then((res) => {
        setResponse(res.data);
      })
      .catch((error) => {
        console.error("Post.tsx error:", error);
      });
  }, []);

  return (
    <>
      <h1>{props.region}</h1>
      <h1>{props.id}</h1>
      <h1>{JSON.stringify(response)}</h1>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { region, id } = context.params!;
  return {
    props: {
      region,
      id,
    },
  };
};
