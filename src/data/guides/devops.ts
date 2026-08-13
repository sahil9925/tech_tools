import type { ToolGuide } from '@/types/guide'

export const devopsGuides: Record<string, ToolGuide> = {
  'docker-compose-generator': {
    toolId: 'docker-compose-generator',
    introduction: 'The Docker Compose Generator provides a visual form builder to construct production-ready `docker-compose.yml` configuration files. It supports multi-service definitions, image tags, container names, port mappings, environment variables, volumes, dependencies (`depends_on`), and restart policies.',
    whatIsIt: {
      title: 'What is Docker Compose?',
      content: [
        'Docker Compose is a tool for defining and running multi-container Docker applications using a single YAML configuration file.',
        'It allows developers to start, stop, and manage entire stacks (web servers, databases, cache layers) with a single command: `docker compose up -d`.'
      ],
      keyConcepts: [
        { term: 'services', explanation: 'Defines individual container workloads (e.g. web, db, redis).' },
        { term: 'ports', explanation: 'Host to container port mapping (e.g. "8080:80").' },
        { term: 'volumes', explanation: 'Persistent data mounts linking host paths to container directories.' },
        { term: 'depends_on', explanation: 'Specifies service startup dependency order.' }
      ]
    },
    howItWorks: {
      title: 'How Generator Logic Works',
      steps: [
        'Collects service parameters (name, image, ports, env, volumes, restart, command).',
        'Validates field strings and key-value formats.',
        'Assembles clean Docker Compose v2 YAML string.',
        'Provides copy and .yml file download options.'
      ]
    },
    howToUse: {
      title: 'How to Generate Docker Compose Files',
      steps: [
        'Enter Project Name.',
        'Configure Service 1 (Image name, container name, restart policy).',
        'Add Ports, Environment Variables (KEY=VALUE), and Volume mappings.',
        'Click Add Service to add additional container workloads (e.g. PostgreSQL or Redis).',
        'Click Generate YAML to preview and download docker-compose.yml.'
      ]
    },
    examples: [
      {
        title: 'Nginx + Node.js + Postgres Stack',
        input: 'Project: webapp, Service: web (nginx:latest, port 80:80), Service: app (node:18, port 3000:3000)',
        output: 'name: webapp\nservices:\n  web:\n    image: nginx:latest\n    ports:\n      - "80:80"\n  app:\n    image: node:18\n    ports:\n      - "3000:3000"',
        explanation: 'Generates valid Docker Compose v2 multi-service YAML file.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Output Fields',
      fields: [
        { name: 'services', type: 'YAML Object', description: 'Container workload declarations.' },
        { name: 'restart: unless-stopped', type: 'Policy', description: 'Automatically restarts container if crashed unless manually stopped.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Hardcoding Database Passwords in Git Commits',
        description: 'Hardcoding secret passwords directly in docker-compose.yml exposes secrets in source code control.',
        badExample: 'POSTGRES_PASSWORD=mysecretpassword123',
        goodExample: 'Use .env file variables: POSTGRES_PASSWORD=${DB_PASSWORD}'
      }
    ],
    bestPractices: [
      'Always specify explicit image version tags (e.g. postgres:15-alpine) instead of postgres:latest.',
      'Use named volumes for persistent database storage.'
    ],
    useCases: [
      { title: 'Local Development Setup', description: 'Spin up local Postgres, Redis, and API services with one command.' }
    ],
    troubleshooting: [
      { problem: 'Port already in use', cause: 'Host port (e.g. 80) is bound by another service.', solution: 'Change host port mapping (e.g. 8080:80).' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Generated 100% locally in browser memory. No containers are created or executed.' },
    faq: [
      { question: 'What version of Docker Compose is generated?', answer: 'Generates modern Docker Compose v2 specification (no top-level version tag required).' }
    ],
    technicalReferences: [
      { title: 'Docker Compose Specification', url: 'https://docs.docker.com/compose/compose-file/', description: 'Official Docker Compose file reference.' }
    ],
    summary: 'Docker Compose generation speeds up orchestrating local multi-container development stacks.'
  },

  'kubernetes-generator': {
    toolId: 'kubernetes-generator',
    introduction: 'The Kubernetes YAML Generator constructs valid Kubernetes manifest files for Deployments, Services, Ingresses, Namespaces, ConfigMaps, and Jobs. It enforces correct API versions, metadata labels, container port targets, and resource limits.',
    whatIsIt: {
      title: 'What are Kubernetes Manifests?',
      content: [
        'Kubernetes manifests are YAML or JSON files that describe the desired state of cluster resources (Deployments, Pods, Services, Ingresses).',
        'The Kubernetes control plane reads these manifests to deploy, scale, and maintain application workloads.'
      ],
      keyConcepts: [
        { term: 'Deployment (apps/v1)', explanation: 'Manages replicated Pod instances, rolling updates, and scaling.' },
        { term: 'Service (v1)', explanation: 'Networking abstraction providing stable IP and DNS entry for a set of Pods.' },
        { term: 'Ingress (networking.k8s.io/v1)', explanation: 'Exposes HTTP/HTTPS routes from outside the cluster to internal Services.' },
        { term: 'Resource Requests & Limits', explanation: 'CPU and memory allocations preventing noisy-neighbor container issues.' }
      ]
    },
    howItWorks: {
      title: 'How Kubernetes Generation Works',
      steps: [
        'Select Resource Kind (Deployment, Service, Ingress, Namespace, ConfigMap, Job).',
        'Fills parameters into valid Kubernetes API template schemas.',
        'Formats selector labels and port mapping arrays.',
        'Outputs clean .yaml file for kubectl apply -f.'
      ]
    },
    howToUse: {
      title: 'How to Generate Kubernetes Manifests',
      steps: [
        'Select resource type (e.g. Deployment).',
        'Enter Name, Namespace, Container Image, Replicas, and Container Port.',
        'Configure CPU/Memory requests and limits.',
        'Click Generate YAML.',
        'Copy or download generated .yaml file.'
      ]
    },
    examples: [
      {
        title: 'Nginx Deployment Manifest',
        input: 'Kind: Deployment, Name: my-web, Image: nginx:latest, Replicas: 3, Port: 80',
        output: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-web\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-web\n  template:\n    metadata:\n      labels:\n        app: my-web\n    spec:\n      containers:\n        - name: my-web\n          image: nginx:latest\n          ports:\n            - containerPort: 80',
        explanation: 'Generates valid Kubernetes deployment manifest ready for kubectl apply.'
      }
    ],
    resultExplanation: {
      title: 'Understanding Manifest Fields',
      fields: [
        { name: 'apiVersion', type: 'String', description: 'Target Kubernetes API endpoint (e.g. apps/v1).' },
        { name: 'kind', type: 'String', description: 'Object type (Deployment, Service, Ingress).' },
        { name: 'spec.selector', type: 'Label Matcher', description: 'Binds Deployment controller to Pods matching label.' }
      ]
    },
    commonMistakes: [
      {
        title: 'Selector Mismatch between Deployment and Service',
        description: 'If Service spec.selector does not match Deployment spec.template.metadata.labels, traffic will fail to reach Pods.',
        badExample: 'Deployment label: app=web; Service selector: app=frontend',
        goodExample: 'Ensure app label strings match exactly across both manifests.'
      }
    ],
    bestPractices: [
      'Always set CPU/Memory resource requests and limits on every container.',
      'Use namespaces to isolate development, staging, and production environments.'
    ],
    useCases: [
      { title: 'Cluster Application Deployment', description: 'Generate manifests to deploy web microservices onto EKS, GKE, or AKS clusters.' }
    ],
    troubleshooting: [
      { problem: 'error: unable to recognize "file.yaml": no matches for kind', cause: 'Deprecated or invalid apiVersion.', solution: 'Use modern apiVersion (apps/v1 for Deployment, networking.k8s.io/v1 for Ingress).' }
    ],
    securityPrivacy: { isLocalProcessing: true, details: 'Generated 100% locally in browser. No connection to any Kubernetes cluster is made.' },
    faq: [
      { question: 'What is the difference between Service port and targetPort?', answer: 'port is the IP port exposed by the Service inside the cluster; targetPort is the port the container is listening on.' }
    ],
    technicalReferences: [
      { title: 'Kubernetes API Reference Documentation', url: 'https://kubernetes.io/docs/reference/kubernetes-api/', description: 'Official Kubernetes API specifications.' }
    ],
    summary: 'Kubernetes manifest generation simplifies creating cluster resource definitions accurately.'
  }
}
