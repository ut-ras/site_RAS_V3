import Image from 'next/image';
import cadence from '../../../public/images/sponsors/Cadence-Logo.png'
import pcbway from '../../../public/images/sponsors/PCBWay-Logo.png'
import gene from '../../../public/images/sponsors/Gene-Logo.png'


//Place sponsors here
export const sponsors = {
  diamond: [
    
  ],
  platinum: [
    
  ],
  gold: [
    { image: cadence, name: 'Cadence' },
  ],
  silver: [
    
  ],
  bronze: [],
  VEXU: [
    {image: pcbway, name: 'PCBWay'},
    {image: gene, name: 'Gene Haas Foundation'}
  ],
  stampede: [
    {image: gene, name: 'Gene Haas Foundation'}
  ]
};


type Sponsor = {
  image: string;
  name: string;
};

type SponsorTier = {
  diamond: Sponsor[];
  platinum: Sponsor[];
  gold: Sponsor[];
  silver: Sponsor[];
  bronze: Sponsor[];
  VEXU: Sponsor[];
  stampede: Sponsor[];
};

export default function SponsorDisplay() {

  const tierOrder: (keyof SponsorTier)[] = ['diamond', 'platinum', 'gold', 'silver', 'bronze', 'VEXU', 'stampede'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {tierOrder.map((tier) => {
        const sponsorsInTier = sponsors[tier];
        if (!sponsorsInTier || sponsorsInTier.length === 0) return null;
        return (
          <div key={tier} className="mb-12 last:mb-0">
            <h2 className={`text-[2.75rem] font-bold mb-6 text-center text-black bg-clip-text`}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
              {sponsorsInTier.map((sponsor, index) => (
                <div key={index} className="flex flex-col items-center p-4 bg-[#e6e4d8] rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative w-32 h-32 mb-4">
                    <Image
                      src={sponsor.image}
                      alt={sponsor.name}
                      fill
                      className="object-contain"
                      sizes="100px, 100px"
                    />
                  </div>
                  <p className="text-center text-3xl text-black">{sponsor.name}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}