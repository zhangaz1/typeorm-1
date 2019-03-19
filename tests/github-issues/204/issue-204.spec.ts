import "reflect-metadata";
import {Record} from "./entity/Record";
import {Connection} from "../../../src";
import {closeTestingConnections, createTestingConnections, reloadTestingDatabases} from "../../../test/utils/test-utils";
import {RecordData} from "./entity/RecordData";

describe("github issues > #204 jsonb array is not persisted correctly", () => {

    let connections: Connection[];
    beforeAll(async () => connections = await createTestingConnections({
        entities: [Record],
        enabledDrivers: ["postgres"] // because only postgres supports jsonb type
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    afterAll(() => closeTestingConnections(connections));

    test("should persist json and jsonb arrays correctly", () => Promise.all(connections.map(async connection => {
        const record = new Record();
        record.datas = [
            new RecordData("hello1", "hello2", "hello3", "hello4", true, false),
            new RecordData("hi1", "hi2", "hi3", "hi4", false, true),
            new RecordData("bye1", "bye2", "bye3", "bye4", false, false),
        ];
        record.configs = [
            { id: 1, option1: "1", option2: "1", option3: "1", isActive: true, extra: { data1: "one", data2: "two" } },
            { id: 2, option1: "2", option2: "2", option3: "2", isActive: false, extra: { data1: "one", data2: "two" } },
            { id: 3, option1: "3", option2: "3", option3: "3", isActive: true, extra: { data1: "one", data2: "two" } },
        ];
        await connection.manager.save(record);

        const foundRecord = await connection.manager.findOne(Record, record.id);
        expect(foundRecord).not.toBeUndefined();
        expect(foundRecord!.datas).toEqual([
            new RecordData("hello1", "hello2", "hello3", "hello4", true, false),
            new RecordData("hi1", "hi2", "hi3", "hi4", false, true),
            new RecordData("bye1", "bye2", "bye3", "bye4", false, false),
        ]);
        expect(foundRecord!.configs).toEqual([
            { id: 1, option1: "1", option2: "1", option3: "1", isActive: true, extra: { data1: "one", data2: "two" } },
            { id: 2, option1: "2", option2: "2", option3: "2", isActive: false, extra: { data1: "one", data2: "two" } },
            { id: 3, option1: "3", option2: "3", option3: "3", isActive: true, extra: { data1: "one", data2: "two" } },
        ]);
    })));

});