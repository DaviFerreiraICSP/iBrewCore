import { DataSourceOptions } from "typeorm";

export default {
    type: "sqlite",
    database: "db.sqlite",
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
} satisfies DataSourceOptions;