import { Disclosure } from "@headlessui/react";
import { BellIcon, MenuIcon, XIcon } from "@heroicons/react/outline";
import classNames from "classnames";
import Head from "next/head";
import Image from "next/image";
import Header from "../components/Header";

const navigation = [
  { name: "League of Legends", href: "#", current: true },
  { name: "TFT", href: "#", current: false },
];

export default function Home() {
  return (
    <div>
      <Head>
        <title>LoL Hours</title>
        <meta name="description" content="League Of Legends Hours" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <input
        type="text"
        name="Summoner"
        id="Summoner"
        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
        placeholder="Summon Name"
      />

      {/* <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <img src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer> */}
    </div>
  );
}
