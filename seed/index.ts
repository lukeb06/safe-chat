import { seedMessage, undoMessage } from './message';
import { seedUser, undoUser } from './user';

async function seed() {
    await seedUser();
    await seedMessage();
}

async function undo() {
    await undoMessage();
    await undoUser();
}

async function main() {
    await undo();
    await seed();
}

main();
