import type { TeamMember } from "./teamData";

type Props = {
  member: TeamMember;
  active?: boolean;
  onToggle?: () => void;
};

export default function TeamCard({ member, active = false, onToggle }: Props) {
  return (
    <div
      className="relative overflow-hidden cursor-pointer select-none"
      onClick={onToggle}
    >
      <img
        src={member.img}
        alt={member.name}
        className={`w-full h-96 object-cover object-top transition-transform duration-500 ${
          active ? "scale-105" : "scale-100"
        }`}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 bg-black/80 p-5 transition-transform duration-300 ${
          active ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <h3 className="text-white font-bold text-xl">{member.name}</h3>
        <p className="text-orange-500 text-sm tracking-widest uppercase mt-1">{member.role}</p>
      </div>
    </div>
  );
}
