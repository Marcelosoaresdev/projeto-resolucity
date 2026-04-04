import fs from 'fs';

const DB_PATH = './src/database/users.json';

const userRepository = {
    createUser: (nome, email, senha) => {
        const users = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        const newUser = {
            id: users.length + 1,
            nome,
            email,
            senha
        };
        users.push(newUser);
        // JSON.stringify(valor, replacer, espaços)
        // - null: sem filtro de campos (salva tudo)
        // - 2: indenta o arquivo com 2 espaços, deixando legível para humanos
        fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
        return { newUser, message: 'Usuário criado com sucesso!' };
    }
};

export default userRepository;