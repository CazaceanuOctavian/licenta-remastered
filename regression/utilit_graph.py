import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import argparse

def plot_feature_counts(csv_file, output_file=None, top_n=None, sort_by='count'):
    """
    Read a CSV file containing feature counts and plot them as a horizontal bar chart.
    
    Parameters:
    -----------
    csv_file : str
        Path to the CSV file
    output_file : str, optional
        Path to save the output image. If None, the plot will be displayed
    top_n : int, optional
        Number of top features to display. If None, all features are displayed
    sort_by : str, optional
        How to sort the features: 'count' (descending) or 'name' (alphabetical)
    """
    # Read the CSV file
    df = pd.read_csv(csv_file, header=0)
    
    # Rename columns if they match the expected format
    if df.shape[1] == 2 and df.columns[0] == '' and df.columns[1] == '0':
        df.columns = ['Feature', 'Count']
    elif df.shape[1] == 2:
        # If columns don't match expected names but there are only 2 columns
        df.columns = ['Feature', 'Count']
    
    # Sort the dataframe
    if sort_by == 'count':
        df = df.sort_values('Count', ascending=False)
    elif sort_by == 'name':
        df = df.sort_values('Feature')
    
    # Take only top N if specified
    if top_n is not None and top_n > 0:
        df = df.head(top_n)
    
    # Create a larger figure for better readability
    plt.figure(figsize=(12, max(8, len(df) * 0.25)))
    
    # Create horizontal bar chart
    ax = sns.barplot(x='Count', y='Feature', data=df, palette='viridis')
    
    # Add count values at the end of each bar
    for i, v in enumerate(df['Count']):
        ax.text(v + 0.1, i, str(v), va='center')
    
    # Customize the plot
    plt.title('Feature Counts', fontsize=16)
    plt.xlabel('Count', fontsize=12)
    plt.ylabel('Feature Name', fontsize=12)
    plt.tight_layout()
    
    # Save or display the plot
    if output_file:
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"Plot saved to {output_file}")
    else:
        plt.show()

if __name__ == "__main__":
    # Set up argument parser
    parser = argparse.ArgumentParser(description='Plot feature counts from a CSV file')
    parser.add_argument('csv_file', type=str, help='Path to the CSV file')
    parser.add_argument('--output', '-o', type=str, help='Path to save the output image')
    parser.add_argument('--top', '-t', type=int, help='Number of top features to display')
    parser.add_argument('--sort', '-s', type=str, choices=['count', 'name'], default='count',
                      help='Sort by count (default) or name')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Plot the data
    plot_feature_counts(args.csv_file, args.output, args.top, args.sort)