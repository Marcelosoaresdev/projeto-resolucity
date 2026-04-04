import userRepository from '../repositories/userRepository.js'; 

const authController = {
    createUser(req, res) {
        const { nome, email, senha } = req.body;
        const result = userRepository.createUser(nome, email, senha);
        res.status(201).json(result);
    }
}

export default authController;