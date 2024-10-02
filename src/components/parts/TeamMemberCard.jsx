import Image from "next/image";

export default function TeamMemberCard({ name, role, bio, image }) {
  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-col items-center">
        <Image
          src={image}
          alt={`${name} photo`}
          width={200}
          height={150}
          className="rounded-full"
          priority  // Ensuring priority loading for critical images
        />
        <h3 className="text-2xl font-bold mt-4">{name}</h3>
        <p className="text-sm text-gray-400">{role}</p>
        <p className="mt-4">{bio}</p>
      </div>
    </div>
  );
}
