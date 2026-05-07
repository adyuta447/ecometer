export interface RankTeam {
  id: string;
  rank: number;
  name: string;
  efficiencyText: string;
  efficiencyValue: number;
  kwhDiff: number;
  kwhText: string;
}

export function useLeaderboard() {
  const winner = {
    team: "Tim Frontend",
    message:
      "Tim Front-End bulan ini berhasil menghemat energi 10% lebih banyak dari Tim Desain!",
  };

  const rankings: RankTeam[] = [
    {
      id: "1",
      rank: 1,
      name: "Tim Frontend",
      efficiencyText: "+18% Target Efisiensi",
      efficiencyValue: 18,
      kwhDiff: -450,
      kwhText: "Dihemat",
    },
    {
      id: "2",
      rank: 2,
      name: "Creative Ops",
      efficiencyText: "+12% Target Efisiensi",
      efficiencyValue: 12,
      kwhDiff: -320,
      kwhText: "Dihemat",
    },
    {
      id: "3",
      rank: 3,
      name: "DevOps Infrastruktur",
      efficiencyText: "-4% Target Efisiensi",
      efficiencyValue: -4,
      kwhDiff: 80,
      kwhText: "Melebihi Batas",
    },
  ];

  const totalSavedKwh = 1240;
  const sharedLink = "ecometer.id/p/leaderboard/49a...";

  return {
    winner,
    rankings,
    totalSavedKwh,
    sharedLink,
  };
}
