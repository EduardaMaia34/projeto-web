package com.br.edu.ufersa.pw.projeto.feed.API.controller;

// ... imports ...
import com.br.edu.ufersa.pw.projeto.Security.CustomUserDetails;
import com.br.edu.ufersa.pw.projeto.feed.Service.FeedService;
import com.br.edu.ufersa.pw.projeto.review.API.dto.ReturnReviewDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity; // Para retornar o status 200/401
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feed")
public class FeedController {

    @Autowired
    private FeedService feedService;

    @GetMapping
    public ResponseEntity<List<ReturnReviewDTO>> getFeed(
            @AuthenticationPrincipal CustomUserDetails loggedInUser) {

        if (loggedInUser == null || loggedInUser.getId() == null) {

            return ResponseEntity.status(401).build();
        }

        List<ReturnReviewDTO> feed = feedService.gerarFeed(loggedInUser.getId());
        return ResponseEntity.ok(feed);
    }
}