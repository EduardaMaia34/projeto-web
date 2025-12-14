package com.br.edu.ufersa.pw.projeto.feed.Service;

import com.br.edu.ufersa.pw.projeto.review.API.dto.ReturnReviewDTO;
import com.br.edu.ufersa.pw.projeto.review.Model.entity.Review;
import com.br.edu.ufersa.pw.projeto.review.Model.repository.ReviewRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.User;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.UserRepository;
import com.br.edu.ufersa.pw.projeto.user.Model.entity.Seguindo;
import com.br.edu.ufersa.pw.projeto.user.Model.repository.SeguindoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FeedService {

    @Autowired
    private SeguindoRepository seguindoRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ReturnReviewDTO> gerarFeed(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        // 1. busca quem o usuário segue
        List<User> seguindo = seguindoRepository.findBySeguidor(user)
                .stream()
                .map(Seguindo::getSeguido)
                .collect(Collectors.toList());

        seguindo.add(user);

        List<Review> reviewsAmigos = reviewRepository.findByUserIn(seguindo);


        return reviewsAmigos.stream()
                .map(ReturnReviewDTO::new)
                .collect(Collectors.toList());
    }
}
