import type { TeamMember } from "./teamData";

export default function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="relative overflow-hidden group cursor-pointer">
      <img
        src={member.img}
        alt={member.name}
        className="w-full h-96 object-cover object-top group-hover:scale-105 transition-transform duration-500"
      />
      {/* Overlay slides up on hover */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-white font-bold text-xl">{member.name}</h3>
        <p className="text-orange-500 text-sm tracking-widest uppercase mt-1">
          {member.role}
        </p>
      </div>
    </div>
  );
}
