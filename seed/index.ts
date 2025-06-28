import { undoChannel } from './channel';
import { undoMessage } from './message';
import { seedUser, undoUser } from './user';

async function seed() {
    await seedUser();
}

async function undo() {
    await undoMessage();
    await undoUser();
    await undoChannel();
}

async function main() {
    await undo();
    await seed();
    console.log('Seeded successfully');
}

main();
