# System Architecture Diagram

```mermaid
flowchart LR
    subgraph DataLayer[Data Layer]
        A[Access Log Generator]
        B[Attack Injection Engine]
        C[(access_logs.csv)]
        D[(labels.csv)]
    end

    subgraph Processing[Data Processing & Feature Engineering]
        E[Feature Engineering Module]
        F[Sequence Feature Extractor]
        G[Preprocessing Pipeline]
    end

    subgraph Training[Training & Model Development]
        H[Isolation Forest Trainer]
        I[XGBoost Attack Classifier Trainer]
        J[Risk Scoring Engine]
        K[(Saved Models)]
    end

    subgraph Explainability[Explainability & Reporting]
        L[SHAP Explanation Engine]
        M[Report & Presentation Outputs]
    end

    subgraph Runtime[Real-Time Inference Stream]
        N[Streaming Event Simulator]
        O[Online Feature Engineering]
        P[Behavior Anomaly Detector]
        Q[Attack Type Classifier]
        R[Risk Scoring]
    end

    subgraph UI[SOC Dashboard]
        S[Streamlit Dashboard]
        T[Overview]
        U[Live Alerts]
        V[Attack Analytics]
        W[Entity History]
        X[Model Explainability]
        Y[Statistics]
    end

    A --> C
    B --> D
    C --> E
    D --> E
    E --> F
    F --> G
    G --> H
    G --> I
    H --> K
    I --> K
    K --> P
    K --> Q
    J --> R
    L --> S
    M --> S

    N --> O
    O --> P
    P --> Q
    Q --> R
    R --> S

    S --> T
    S --> U
    S --> V
    S --> W
    S --> X
    S --> Y
```

## Architecture Summary

- Synthetic and labeled cybersecurity data are generated first.
- Feature engineering transforms raw events into behavior and anomaly features.
- Isolation Forest learns normal behavior and detects anomalies.
- XGBoost classifies the nature of detected attacks.
- Risk scoring combines model confidence, behavioral deviations, and suspicious activity signals.
- SHAP explainability provides interpretable reasons for each alert.
- A Streamlit-based SOC dashboard visualizes live alerts and analytics.
