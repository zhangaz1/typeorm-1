import {join as joinPaths} from "../../../vendor/https/deno.land/std/path/mod.ts";
import {runIfMain} from "../../deps/mocha.ts";
import {expect} from "../../deps/chai.ts";
import {getDirnameOfCurrentModule, closeTestingConnections, createTestingConnections, reloadTestingDatabases} from "../../utils/test-utils.ts";
import {Connection} from "../../../src/connection/Connection.ts";
import {Post} from "./entity/Post.ts";

describe("other issues > joining empty relations", () => {

    let connections: Connection[];
    const __dirname = getDirnameOfCurrentModule(import.meta);
    before(async () => connections = await createTestingConnections({
        entities: [joinPaths(__dirname, "/entity/*.ts")],
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("should return empty array if its joined and nothing was found", () => Promise.all(connections.map(async function(connection) {

        const post = new Post();
        post.title = "Hello Post";
        await connection.manager.save(post);

        // check if ordering by main object works correctly

        const loadedPosts1 = await connection.manager
            .createQueryBuilder(Post, "post")
            .leftJoinAndSelect("post.categories", "categories")
            .getMany();

        expect(loadedPosts1).not.to.be.undefined;
        loadedPosts1.should.be.eql([{
            id: 1,
            title: "Hello Post",
            categories: []
        }]);

    })));

    it("should return empty array if its joined and nothing was found, but relations in empty results should be skipped", () => Promise.all(connections.map(async function(connection) {

        const post = new Post();
        post.title = "Hello Post";
        await connection.manager.save(post);

        // check if ordering by main object works correctly

        const loadedPosts1 = await connection.manager
            .createQueryBuilder(Post, "post")
            .leftJoinAndSelect("post.categories", "categories")
            .leftJoinAndSelect("categories.authors", "authors")
            .getMany();

        expect(loadedPosts1).not.to.be.undefined;
        loadedPosts1.should.be.eql([{
            id: 1,
            title: "Hello Post",
            categories: []
        }]);

    })));

});

runIfMain(import.meta);
