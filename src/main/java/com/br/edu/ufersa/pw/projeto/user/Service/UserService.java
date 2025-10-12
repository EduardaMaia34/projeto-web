package com.br.edu.ufersa.pw.projeto.user.Service;

import com.br.edu.ufersa.pw.projeto.user.API.dto.InputUserDTO;
import com.br.edu.ufersa.pw.projeto.user.API.dto.ReturnUserDTO;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Interesse;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.InteresseRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository repository;
    private final InteresseRepository interesseRepository; // ✅ Adicione isto

    @Autowired
    public UserService(UserRepository repository, InteresseRepository interesseRepository) {
        this.repository = repository;
        this.interesseRepository = interesseRepository;
    }

    public List<ReturnUserDTO> buscarPorNome(String name) {
        List<User> users = repository.findByNomeContainingIgnoreCase(name);
        return users.stream()
                .map(ReturnUserDTO::new)
                .collect(Collectors.toList());}

    public List<ReturnUserDTO> listarTodos(){
        List<User> todosUsuarios = repository.findAll();
        return todosUsuarios.stream().map(user-> new ReturnUserDTO(user)).toList();
    }

    public ReturnUserDTO save(InputUserDTO dto){
        User user = repository.save(new User(dto));
        if (dto.getInteressesIds() != null && !dto.getInteressesIds().isEmpty()) {
            if (dto.getInteressesIds().size() > 3) {
                throw new IllegalArgumentException("O usuário só pode escolher até 3 interesses.");
            }

            List<Interesse> interesses = interesseRepository.findAllById(dto.getInteressesIds());
            user.setInteresses(interesses);
        }

        repository.save(user);
        return new ReturnUserDTO(user);

    }

}
