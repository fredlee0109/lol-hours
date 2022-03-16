import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Search() {
  const [state, setState] = useState({ summonerName: "" });
  const router = useRouter();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    router.push({
      pathname: `summoner/NA1/${state.summonerName}`,
    });
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setState({ summonerName: event.target.value });
  }

  return (
    <div className="fixed h-screen w-screen flex items-center justify-center bg-indigo-300">
      <div className="w-80 lg:w-[40rem] -mt-60">
        <form onSubmit={handleSubmit} className="relative">
          <input
            onChange={handleChange}
            value={state.summonerName}
            className="rounded-sm pl-5 pr-24 h-12 w-full focus:outline-none 
            border border-slate-300 focus:border-sky-500"
            type="text"
            name="Summoner"
            id="Summoner"
            placeholder="Summon Name"
            autoComplete="off"
          />
          <button
            className="h-10 w-20 mt-1 absolute bg-indigo-600 rounded-md left-[14.5rem] lg:left-[34.5rem]"
            type="submit"
          >
            <Image src="/icon-gg-white.svg" alt=".GG" height={40} width={50} />
          </button>
        </form>
      </div>
    </div>
  );
}
