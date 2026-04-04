package com.ontology;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.ontology.mapper")
public class OntologyBackendApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(OntologyBackendApplication.class, args);
    }
}
