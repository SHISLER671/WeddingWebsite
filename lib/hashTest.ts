import { hashPassword } from './crypto';

async function generateAdminHashes() {
  const [brideHash, brideSalt] = await hashPassword('BRIDESTAYIRIE');
  const [groomHash, groomSalt] = await hashPassword('GROOMSTAYIRIE');
  const [plannerHash, plannerSalt] = await hashPassword('PLANNERSTAYIRIE');
  console.log({ bride: `${brideSalt}:${brideHash}`, groom: `${groomSalt}:${groomHash}`, planner: `${plannerSalt}:${plannerHash}` });
}

generateAdminHashes();
