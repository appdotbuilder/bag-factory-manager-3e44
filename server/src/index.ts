import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createBagInputSchema, 
  updateBagInputSchema, 
  getBagInputSchema, 
  deleteBagInputSchema 
} from './schema';

// Import handlers
import { createBag } from './handlers/create_bag';
import { getBags } from './handlers/get_bags';
import { getBag } from './handlers/get_bag';
import { updateBag } from './handlers/update_bag';
import { deleteBag } from './handlers/delete_bag';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new bag
  createBag: publicProcedure
    .input(createBagInputSchema)
    .mutation(({ input }) => createBag(input)),
  
  // Get all bags
  getBags: publicProcedure
    .query(() => getBags()),
  
  // Get a single bag by ID
  getBag: publicProcedure
    .input(getBagInputSchema)
    .query(({ input }) => getBag(input)),
  
  // Update an existing bag
  updateBag: publicProcedure
    .input(updateBagInputSchema)
    .mutation(({ input }) => updateBag(input)),
  
  // Delete a bag by ID
  deleteBag: publicProcedure
    .input(deleteBagInputSchema)
    .mutation(({ input }) => deleteBag(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();