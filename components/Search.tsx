import Image from "next/image";

export default function Search() {
  return (
    <div className="fixed h-screen w-screen flex items-center justify-center bg-indigo-300">
      <div className="w-[40rem] -mt-60">
        <form className="relative">
          <input
            className="rounded-sm px-5 h-12 w-full focus:outline-none 
            border border-slate-300 focus:border-sky-500"
            type="text"
            name="Summoner"
            id="Summoner"
            placeholder="Summon Name"
            autoComplete="off"
          />
          <button
            className="h-10 w-20 mt-1 absolute bg-indigo-600 rounded-md left-[34.5rem]"
            type="submit"
          >
            <Image src="/icon-gg-white.svg" alt=".GG" height={40} width={50} />
          </button>
        </form>
      </div>
    </div>
  );
}
