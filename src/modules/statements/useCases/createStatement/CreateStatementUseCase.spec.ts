import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let user: User

describe("Create Statement", () => {
    beforeEach(async () => {
        statementsRepository = new InMemoryStatementsRepository();
        usersRepository = new InMemoryUsersRepository();
        createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);

        user = await usersRepository.create({
            email: "john_doe@gmail.com",
            name: "John Doe",
            password: "johnisaniceguy123"
        })
    })

    it("should be able to create a new deposit statement", async () => {
        const statement = await createStatementUseCase.execute({
            user_id: user.id,
            type: "deposit" as any,
            amount: 500,
            description: "Test"
        })

        expect(statement).toHaveProperty("id");
    })

    it("should be able to create a new withdraw statement", async () => {
        await createStatementUseCase.execute({
            user_id: user.id,
            type: "deposit" as any,
            amount: 500,
            description: "Test"
        })
        
        const statement = await createStatementUseCase.execute({
            user_id: user.id,
            type: "withdraw" as any,
            amount: 100,
            description: "Test"
        })

        expect(statement).toHaveProperty("id");
    })

    it("should not be able to create a new withdraw statement with a value greater than the user balance", async () => {
        expect(async () => {
            await createStatementUseCase.execute({
                user_id: user.id,
                type: "withdraw" as any,
                amount: 1000,
                description: "Hey you dont have all that dude!"
            })
        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
    })

    it("should not be able to create a new statement for a non-existing user", async () => {
        expect(async () => {
            await createStatementUseCase.execute({
                user_id: "definitly not john's id",
                type: "deposit" as any,
                amount: 100,
                description: "Test"
            })
        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
    })
})