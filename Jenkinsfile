pipeline {
    agent any
    tools {
        nodejs 'Node.js'
    }
    environment {
        CI = 'true'
        NEXT_TELEMETRY_DISABLED = '1'
        // Supabase local (claves demo públicas que trae `supabase start`).
        DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
        DIRECT_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
        NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/wWkarlosWw/hadassa-web.git',
                    credentialsId: 'wWkarlosWw'
            }
        }
        stage('Instalar dependencias') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Calidad (lint + tipos)') {
            steps {
                sh 'npm run lint'
                sh 'npm run typecheck'
            }
        }
        stage('Tests unitarios (Vitest)') {
            steps {
                sh 'mkdir -p test-results'
                sh 'npx vitest run --project unit --reporter=default --reporter=junit --outputFile.junit=test-results/unit.xml'
            }
        }
        stage('Base de datos de pruebas (Supabase local)') {
            steps {
                sh 'npx supabase start'
                sh 'npx prisma migrate deploy'
            }
        }
        stage('Tests de integración') {
            steps {
                sh '''
                  export NEXT_PUBLIC_SUPABASE_ANON_KEY=$(npx supabase status -o env | grep '^ANON_KEY=' | cut -d'"' -f2)
                  export SUPABASE_SERVICE_ROLE_KEY=$(npx supabase status -o env | grep '^SERVICE_ROLE_KEY=' | cut -d'"' -f2)
                  npx vitest run --project integration --reporter=default --reporter=junit --outputFile.junit=test-results/integration.xml
                '''
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }
    post {
        always {
            junit allowEmptyResults: true, testResults: 'test-results/*.xml'
            sh 'npx supabase stop --no-backup || true'
        }
    }
}
