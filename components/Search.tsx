import classNames from "classnames";
import Image from "next/image";

export default function Search() {
  return (
    <div className="fixed h-screen w-screen flex items-center justify-center bg-indigo-300">
      <div className="w-96 -mt-60">
        <form className="rounded-sm">
          <input
            className="h-12 w-full"
            type="text"
            name="Summoner"
            id="Summoner"
            placeholder="Summon Name"
          />
          <button className="h-12 absolute bg-indigo-600" type="submit">
            <Image src="/icon-gg-white.svg" alt=".GG" height={48} width={100} />
          </button>
        </form>
      </div>
    </div>
  );
}
