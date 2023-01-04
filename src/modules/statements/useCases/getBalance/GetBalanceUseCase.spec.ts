import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";


let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let user: User

describe("Create Statement", () => {
    beforeEach(async () => {
        statementsRepository = new InMemoryStatementsRepository();
        usersRepository = new InMemoryUsersRepository();
        getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);

        user = await usersRepository.create({
            email: "john_doe@gmail.com",
            name: "John Doe",
            password: "johnisaniceguy123"
        })
    })

    it("should be able to get a user balance", async () => {
        const balance = await getBalanceUseCase.execute({ user_id: user.id })

        expect(balance).toHaveProperty("balance")
        expect(balance).toHaveProperty("statement")
    })

    it("should not be able to get a user balance with a non-existing user", async () => {
        expect(async () => {
            await getBalanceUseCase.execute({ user_id: "not-john-user-id" })
        }).rejects.toBeInstanceOf(GetBalanceError)
    })
})
